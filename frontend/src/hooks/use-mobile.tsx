import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function getIsMobileViewport() {
  if (typeof window === "undefined") {
    return true
  }

  return window.innerWidth < MOBILE_BREAKPOINT
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useLayoutEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(getIsMobileViewport())
    }

    onChange()
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Mobile-first until measured so narrow viewports never flash desktop chrome.
  return isMobile ?? true
}
