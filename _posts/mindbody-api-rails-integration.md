---
title: "Wrapping the Mindbody API in Rails: what the docs don't tell you"
excerpt: "Building a Ruby client for the Mindbody API involves more quirks than their documentation suggests. Duplicate clients, phantom contract records, CamelCase everywhere, and a fake credit card to complete a $0 purchase."
date: "2026-01-30T12:00:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url: 
tags: ["swing_bridge", "Ruby", "Rails", "Mindbody API"]
---

There isn't much Ruby content about integrating with the Mindbody API. Their docs are reasonable for surface-level reads, but once you actually wire things up, you run into a pile of quirks that aren't documented anywhere. This post is what I wish existed before I started.

The context: I built a Rails bridge that moves eligible gym members from ABC Financial into Mindbody. Every member intake either creates a new Mindbody client and purchases a membership contract, or handles an existing one correctly. The second case turned out to be the harder one.

---

## The client wrapper

I wrapped the Mindbody HTTP API in a plain Ruby class backed by a thin Faraday client:

```ruby
class MindbodyClient
  class AuthError < StandardError; end
  class ApiError  < StandardError; end

  def initialize(...)
    @http = HttpClient.new(base_url: base, timeout: 60, open_timeout: 10)
  end
end
```

The 60-second timeout isn't paranoia — their API is genuinely slow under load. Several times during development I had requests that took 45+ seconds. The default Faraday timeout would have killed them.

---

## Token caching

Mindbody uses short-lived bearer tokens. You issue one via `usertoken/issue` and it expires in roughly an hour. The naive approach — get a new token on every request — is too slow and will hit rate limits. So I cache it in memory with a buffer:

```ruby
def token
  static = ENV["MBO_STATIC_TOKEN"].to_s.strip
  return static unless static.empty?

  if @cached_token && Time.current < @cached_token_expires_at
    return @cached_token
  end

  res = @http.post("usertoken/issue", body: { Username: @username, Password: @password }, headers: base_headers)
  # ...
  @cached_token = access_token
  @cached_token_expires_at = Time.parse(expires_at) - 60.seconds
  @cached_token
end
```

The `MBO_STATIC_TOKEN` env variable is there for local development. Rather than setting up credentials in every dev environment, you can paste a valid token directly and the client won't bother fetching one.

The 60-second buffer on `expires_at` means you won't use a token right up to the edge and have it expire mid-request.

---

## CamelCase everywhere

Mindbody's API uses CamelCase for all keys, both in requests and responses. `FirstName`, `LastName`, `ClientId`, `ContractID` (yes, mixed casing — it's `ID` not `Id` on some fields). This is fine once you know it, but it means you can't use Rails conventions directly. Symbol keys won't work for request bodies; you need to use the exact casing the API expects.

```ruby
def add_client(first_name:, last_name:, email:, extras: {})
  body = { FirstName: first_name, LastName: last_name, Email: email }.merge(extras)
  request(method: :post, path: "client/addclient", body: body).body
end
```

The response side is the same — `res.body["Client"]["Id"]`, not `res.body[:client][:id]`.

---

## The duplicate client problem

Mindbody doesn't enforce email uniqueness. If a member already exists — maybe they were added manually by staff, or had a previous membership — you'll get a result from `GET client/clientduplicates`. This is actually useful; the challenge is deciding what to do with it.

The endpoint returns an array of potential matches. The approach that worked: prefer an exact email match, fall back to the first result if no exact match exists.

```ruby
def select_duplicate_match(duplicates, email)
  duplicates.find { |dup| dup["Email"].to_s.casecmp(email).zero? } || duplicates.first
end
```

Once you have a duplicate, you need to check if they're active. If they're not, you reactivate them with a `POST client/updateclient` call. Then you check their contracts and decide whether to purchase, skip, or terminate-and-repurchase.

---

## The phantom contract record

Here's the one that really surprised me. When you call `POST sale/purchasecontract`, Mindbody creates *two* records in the client's contract history. One is the actual contract. The other is a phantom record with a different `Id` but the same `ContractID`. If you later try to terminate "all active contracts" by filtering on `ContractID`, you'll find both.

This matters because when I built the contract termination logic, I expected one contract per purchase. The termination loop terminates everything matching by `ContractID` where `TerminationDate` is blank — which catches both records correctly — but it was confusing to debug until I understood what Mindbody was actually creating.

```ruby
def active_client_contracts(client_id:, contract_id:, contracts: nil)
  contracts ||= client_contracts(client_id: client_id)
  Array(contracts).select do |contract|
    contract["ContractID"].to_s == contract_id.to_s && contract["TerminationDate"].blank?
  end
end
```

The contract lookup response also varies between endpoints. `GET client/clientcontracts` returns `Contracts`. But `GET client/clientduplicates` might return `ClientDuplicates`, `Clients`, or `Duplicates` depending on context. You have to handle all three:

```ruby
duplicates = Array(body["ClientDuplicates"] || body["Clients"] || body["Duplicates"])
```

---

## The fake credit card for $0 contracts

To purchase a contract, even a free one, the API requires `CreditCardInfo` in the request body. There's no way around it. If the contract costs $0, Mindbody still validates the card fields format before accepting. I ended up using a standard Visa test number with a future expiry:

```ruby
def default_credit_card_info
  {
    CreditCardNumber: "4111111111111111",
    ExpMonth: "12",
    ExpYear: (Time.current.next_year.year).to_s,
    BillingName: "John Doe",
    BillingAddress: "123 Lake Dr",
    BillingCity: "San Luis Obispo",
    BillingState: "CA",
    BillingPostalCode: "93405"
  }
end
```

The expiry year is computed dynamically so it's always in the future. This presumably needs updating if Mindbody ever starts doing real card validation on zero-cost contracts, but for now it works.

---

## Contract name matching

Contracts in Mindbody are matched by name, but names can have inconsistent whitespace, capitalization, or punctuation depending on who entered them. Rather than doing an exact string match, I normalize both sides before comparing:

```ruby
def normalize_contract_name(name)
  name.to_s.downcase.gsub(/[^a-z0-9]+/, " ").squeeze(" ").strip
end

def find_contract_by_name(name, location_id:)
  target = normalize_contract_name(name)
  list = contracts(location_id: location_id)
  exact = list.find { |c| normalize_contract_name(c["Name"]) == target }
  return exact if exact
  list.find { |c| normalize_contract_name(c["Name"]).include?(target) }
end
```

Strip everything that isn't alphanumeric, squeeze whitespace, lowercase — then do substring matching as a fallback. This saved me from a production bug where a contract was named with an extra space mid-word.

---

## What I'd do differently

Not much, honestly. The wrapper structure held up well. If I were starting over, I'd probably stub the HTTP layer more aggressively for testing — it's tedious to mock CamelCase responses correctly. And I'd add structured logging from day one rather than retrofitting it later.

The Mindbody API is usable. It's just opinionated in ways that aren't well documented, and a few of the quirks (the phantom contract record in particular) cost me real debugging time. Hopefully this saves someone else the same.

---

The full source for this project is on GitHub: [github.com/dmitryjum/swing_bridge](https://github.com/dmitryjum/swing_bridge)
