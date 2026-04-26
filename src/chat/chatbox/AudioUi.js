import AudioBubble from "./AudioBubble";

export default function AudioPlayer({ msg, isMine }) {

  const files = msg.files?.length
    ? msg.files
    : [{
        file_url: msg.file_url,
        file: msg.file,
        type: msg.type,
        duration: msg.duration,
      }];

  return (
    <>
      {files.map((file, index) => (
        <AudioBubble
          key={index}
          file={file}
          msg={msg}
          isMine={isMine}
          index={index}
        />
      ))}
    </>
  );
}