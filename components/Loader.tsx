export default function Loader() {
  return (
    <div
      id="bg-loader"
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
