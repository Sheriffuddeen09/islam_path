import ReplyComment from "./ReplyComment";

export default function Reply ({isDeleting, EMOJIS, toggleReaction, hoverReactions, uniqueEmojisr, userReaction, totalReaction, handleDeleteReply, handleEditReply, loading, replyText, setReplyText, postReply, closeReply, v, comment, onReplyAdded, handleReact}){
    
    return(
        <div>

          <ReplyComment
            loading={loading}
            replyText={replyText}
            setReplyText={setReplyText}
            postReply={postReply}
            closeReply={closeReply}
            v={v}
            comment={comment}
            onReplyAdded={onReplyAdded}
            onReact={handleReact}
            onDelete={handleDeleteReply}
            onEdit={handleEditReply}
            totalReaction={totalReaction}
            userReaction={userReaction}
            uniqueEmojisr={uniqueEmojisr}
            hoverReactions={hoverReactions}
            EMOJIS={EMOJIS}
            toggleReaction ={toggleReaction}
            isDeleting={isDeleting}
          />
        </div>
    )
}