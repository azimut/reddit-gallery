import { RefObject } from 'react';
import Label from '../atoms/Label';
import Input from '../atoms/Input';

export default function Search({
  name,
  label,
  inputRef,
}: {
  name: string;
  label: string;
  inputRef: RefObject<HTMLInputElement>;
}) {
  return (
    <>
      <Label name={name}>{label}</Label>
      <Input name={name} inputRef={inputRef} />
    </>
  );
}
