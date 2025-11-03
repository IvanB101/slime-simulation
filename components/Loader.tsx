export default function Loader({ id }: { id?: string }) {
  return (
    <div
      id={id}
      className="w-full h-full fixed overflow-hidden z-10 left-0 top-0 bg-black"
    >
      <div className="bg-loader-square"></div>
      <div className="bg-loader-square"></div>
      <div className="bg-loader-square"></div>
      <div className="bg-loader-square"></div>
      <div className="bg-loader-square"></div>
      <div className="bg-loader-square"></div>
    </div>
  );
}
