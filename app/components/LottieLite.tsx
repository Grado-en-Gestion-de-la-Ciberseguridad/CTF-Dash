'use client'

import React, { useEffect, useRef } from 'react'
import lottie, { AnimationItem } from 'lottie-web'

type LottieLiteProps = {
  json: any
  loop?: boolean
  autoplay?: boolean
  className?: string
  onComplete?: () => void
  onLoopComplete?: () => void
  speed?: number
}

export default function LottieLite({ json, loop = false, autoplay = true, className, onComplete, onLoopComplete, speed = 1 }: LottieLiteProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const animRef = useRef<AnimationItem | null>(null)

  useEffect(() => {
    if (!ref.current) return
    // Destroy previous instance if any
    if (animRef.current) {
      try { animRef.current.destroy() } catch {}
      animRef.current = null
    }
    const anim = lottie.loadAnimation({
      container: ref.current,
      renderer: 'svg',
      loop,
      autoplay,
      animationData: json,
    })
    animRef.current = anim
    try { anim.setSpeed(speed) } catch {}
    if (onComplete) {
      anim.addEventListener('complete', onComplete)
    }
    if (onLoopComplete) {
      anim.addEventListener('loopComplete', onLoopComplete)
    }
    return () => {
      if (anim) {
        try {
          if (onComplete) anim.removeEventListener('complete', onComplete)
          if (onLoopComplete) anim.removeEventListener('loopComplete', onLoopComplete)
          anim.destroy()
        } catch {}
      }
      animRef.current = null
    }
  }, [json, loop, autoplay, onComplete, onLoopComplete, speed])

  return <div ref={ref} className={className} style={{ width: '100%', height: '100%', pointerEvents: 'none' }} aria-hidden="true" />
}