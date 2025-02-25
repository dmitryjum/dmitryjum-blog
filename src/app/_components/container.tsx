type Props = {
  children?: React.ReactNode;
};

const Container = ({ children }: Props) => {
  return <div className="container mx-auto sm:px-2 md:px-4">{children}</div>;
};

export default Container;
