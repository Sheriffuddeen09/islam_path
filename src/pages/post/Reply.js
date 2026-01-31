import ReplyComment from "./ReplyComment";

export default function Reply ({handleDelete, handleUpdate, setIsDeleting, setIsEditing, isEditing, isDeleting, EMOJIS, toggleReaction, hoverReactions, uniqueEmojisr, userReaction, totalReaction, handleDeleteReply, onEdit, loading, replyText, setReplyText, postReply, closeReply, v, comment, onReplyAdded, handleReact}){
    
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
            onEdit={onEdit}
            totalReaction={totalReaction}
            userReaction={userReaction}
            uniqueEmojisr={uniqueEmojisr}
            hoverReactions={hoverReactions}
            EMOJIS={EMOJIS}
            toggleReaction ={toggleReaction}
            isDeleting={isDeleting}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            setIsDeleting={setIsDeleting}
            handleUpdate={handleUpdate}
            handleDelete = {handleDelete}

          />
        </div>
    )
}