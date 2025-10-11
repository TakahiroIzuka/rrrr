'use client'

interface ScrollToReviewButtonProps {
  clinicName: string
}

export default function ScrollToReviewButton({ clinicName }: ScrollToReviewButtonProps) {
  const handleClick = () => {
    const div3 = document.getElementById('review-section')
    if (div3) {
      const targetPosition = div3.getBoundingClientRect().top + window.pageYOffset
      const startPosition = window.pageYOffset
      const distance = targetPosition - startPosition
      const duration = 1500 // 1.5秒
      let start: number | null = null

      const animation = (currentTime: number) => {
        if (start === null) start = currentTime
        const timeElapsed = currentTime - start
        const progress = Math.min(timeElapsed / duration, 1)

        // easeInOutQuad イージング関数
        const ease = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2

        window.scrollTo(0, startPosition + distance * ease)

        if (timeElapsed < duration) {
          requestAnimationFrame(animation)
        }
      }

      requestAnimationFrame(animation)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="w-full px-4 py-3 rounded text-white text-sm flex flex-col items-center justify-center gap-1 mt-2 mb-2"
      style={{ backgroundColor: 'rgb(220, 194, 219)' }}
    >
      <div className="flex items-center gap-2">
        <span className="font-semibold">{clinicName}のクチコミ一覧はこちら！</span>
        <span className="flex items-center justify-center w-5 h-5 bg-white rounded-full flex-shrink-0">
          <span className="font-bold text-base leading-none" style={{ color: 'rgb(220, 194, 219)', transform: 'translate(0.5px, -1px)' }}>›</span>
        </span>
      </div>
      <span className="text-xs">Review List</span>
    </button>
  )
}
