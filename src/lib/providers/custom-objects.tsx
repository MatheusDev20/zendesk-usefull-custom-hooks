import { createContext, useContext } from 'react';

type Props = {
  client: any;
  children: React.ReactNode;
}

type ContextProps = {
  zaf: any
}

const CustomObjectsContext = createContext<ContextProps | null>(null);

export const CustomObjectsProvider: React.FC<Props> = ({
  client,
  children,
}: Props) => {
  return (
    <CustomObjectsContext.Provider value={{ zaf: client }}>
      {children}
    </CustomObjectsContext.Provider>
  );
}

export const useInternalZafClient = (): ContextProps => {
  const ctx = useContext(CustomObjectsContext);
  if (!ctx) throw new Error('useInternalZafClient must be used within CustomObjectsProvider');
  return ctx;
};