import { JSX } from "solid-js";

export default function Tile(props: { value: number }): JSX.Element {
  return (
    <div
      class={`flex h-20 w-20 items-center justify-center rounded-lg text-2xl font-bold shadow-sm transition-all duration-200 
      ${
        props.value === 0
          ? "bg-slate-100 text-transparent border-2 border-dashed border-slate-300"
          : "bg-white text-slate-800 border border-slate-200"
      }`}
    >
      {props.value === 0 ? "" : props.value}
    </div>
  );
}
