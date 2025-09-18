import { FC, ReactNode, FormEvent } from "react";

interface FormProps {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  className?: string;
}

const Form: FC<FormProps> = ({ onSubmit, children, className = "" }) => {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault(); // Prevenir envío por defecto del formulario
        onSubmit(event);
      }}
      className={`space-y-4 ${className}`} // Espaciado por defecto entre campos del formulario
    >
      {children}
    </form>
  );
};

export default Form;
