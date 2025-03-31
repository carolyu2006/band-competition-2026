import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`)
    
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches)
    }

    // Set initial value
    onChange(mql)

    // Add listener for changes
    mql.addEventListener("change", onChange)

    // Cleanup
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}
