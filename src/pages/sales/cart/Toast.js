const Toast = ({ message, show }) => {
  return (
    <div
      className={`fixed top-5 right-5 z-[10000] transition-all duration-300 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"
      }`}
    >
      <div className="bg-black text-white px-4 py-3 rounded-lg shadow-lg">
        {message}
      </div>
    </div>
  );
};

export default Toast;