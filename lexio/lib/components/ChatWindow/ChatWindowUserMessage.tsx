const ChatWindowUserMessage = ({ message, style, roleLabel, showRoleLabel }) => {
    return <div className="pl-10 w-full flex flex-col items-end">
        {showRoleLabel && <strong className="inline-block mr-2 mb-1 text-sm">{roleLabel}</strong>}
        <div className="mb-6 py-1 px-3.5" style={{
            backgroundColor: style.messageBackgroundColor,
            borderRadius: style.messageBorderRadius,
        }}>
            <div className="inline" style={{ whiteSpace: 'pre-wrap' }}>{message}</div>
        </div>
    </div>

}

export { ChatWindowUserMessage };