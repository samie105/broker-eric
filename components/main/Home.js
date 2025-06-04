import WrappedFile from "./WrappedFile";
import { ThemeProvider } from "../../contexts/themeContext";
import { FormProvider } from "../../contexts/formContext";

export default function Home() {
  return (
    <ThemeProvider>
      <FormProvider>
        <WrappedFile />
      </FormProvider>
    </ThemeProvider>
  );
}
