import PostCommentReplyItem from "./PostCommentReplyItem";

export default function PostCommentReply ({image, handleDelete, replyInputRef, loadingEmoji, handleUpdate, 
                setIsDeleting, setIsEditing, isEditing, isDeleting, EMOJIS, toggleReaction, hoverReactions, 
                uniqueEmojisr, userReaction, totalReaction, handleDeleteReply, onEdit, loading, replyText,
                setReplyText, postReply, closeReply, post, comment, onReplyAdded, handleReact,
                handleReplyToComment, replyTo, setReplyTo, focusReplyInput, setEmojiClick, emojiClick,
                replyImage, setReplyImage
              }){
    
    return(
        <div>

          <PostCommentReplyItem
            loading={loading}
            replyImage={replyImage} setReplyImage={setReplyImage}
            emojiClick={emojiClick} setEmojiClick={setEmojiClick}
            replyText={replyText}
            replyTo={replyTo}
            setReplyTo={setReplyTo}
            setReplyText={setReplyText}
            handleReplyToComment={handleReplyToComment}
            focusReplyInput={focusReplyInput}
            replyInputRef={replyInputRef}
            loadingEmoji={loadingEmoji}
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
            image={image}

          />
        </div>
    )
}