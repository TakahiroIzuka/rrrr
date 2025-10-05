interface ErrorMessageProps {
  message: string
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 text-red-600 text-base text-center">
      <div>
        <h1 className="mb-5">エラーが発生しました</h1>
        <div className="bg-red-50 border border-red-300 rounded-lg p-4 text-red-800">
          <strong>データベースエラー:</strong> {message}
        </div>
      </div>
    </div>
  )
}
