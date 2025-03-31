import type React from "react"

export const BarChart = ({ children, data, margin }: { children: React.ReactNode; data: any; margin: any }) => {
  return (
    <svg width="100%" height="100%" viewBox={`0 0 600 400`}>
      {children}
    </svg>
  )
}

export const Bar = ({ dataKey, fill, name }: { dataKey: string; fill: string; name: string }) => {
  return <rect />
}

export const XAxis = ({ dataKey }: { dataKey: string }) => {
  return null
}

export const YAxis = () => {
  return null
}

export const CartesianGrid = ({ strokeDasharray, stroke }: { strokeDasharray: string; stroke: string }) => {
  return null
}

export const Tooltip = ({ contentStyle, labelStyle }: { contentStyle: any; labelStyle: any }) => {
  return null
}

export const Legend = () => {
  return null
}

export const ResponsiveContainer = ({
  children,
  width,
  height,
}: { children: React.ReactNode; width: string; height: string }) => {
  return <div>{children}</div>
}

