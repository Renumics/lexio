
const ChatWindowAssistantMessage = ({ message, style, roleLabel, showRoleLabel }) => {
    return <div className="w-full flex flex-col justify-start pr-10">
        {showRoleLabel && <strong className="inline-block text-sm ml-2 mb-1">{roleLabel}</strong>}
        <div className="mb-6 py-1 px-3.5" style={{
            backgroundColor: style.messageBackgroundColor,
            borderRadius: style.messageBorderRadius,
        }}>
            <div className="inline" style={{ whiteSpace: 'pre-wrap' }}>{message}</div>
        </div>
    </div>
}

export { ChatWindowAssistantMessage };