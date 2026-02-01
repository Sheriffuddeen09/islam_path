import PostCommentReplyItem from "./PostCommentReplyItem";

export default function PostCommentReply ({handleDelete, handleUpdate, setIsDeleting, setIsEditing, isEditing, isDeleting, EMOJIS, toggleReaction, hoverReactions, uniqueEmojisr, userReaction, totalReaction, handleDeleteReply, onEdit, loading, replyText, setReplyText, postReply, closeReply, post, comment, onReplyAdded, handleReact}){
    
    return(
        <div>

          <PostCommentReplyItem
            loading={loading}
            replyText={replyText}
            setReplyText={setReplyText}
            postReply={postReply}
            closeReply={closeReply}
            post={post}
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