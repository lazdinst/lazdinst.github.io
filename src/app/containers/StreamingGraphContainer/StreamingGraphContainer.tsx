import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import styled from "styled-components";

const StyledTooltip = styled.div`
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border-radius: 5px;
  font-size: 14px;
  border: 1px solid #ccc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

type StreamingGraphContainerProps = {
  data: { time: number; value: number; name: string }[];
};

const StreamingGraphContainer: React.FC<StreamingGraphContainerProps> = ({
  data,
}) => {
  return (
    <div style={{ width: 300, height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 1, right: 1, left: 1, bottom: 1 }}
        >
          <CartesianGrid stroke="rgba(0, 0, 0, 0.5)" />
          <XAxis
            dataKey="time"
            tickFormatter={() => "1"}
            tick={{ fill: "rgb(0,0,0,0)", fontSize: "0.875rem" }}
            tickLine={{ stroke: "#ededed", strokeWidth: 1 }}
            tickCount={10}
            axisLine={{ stroke: "#ededed" }}
            domain={[0, 1]}
          />
          <YAxis
            domain={[-1, 1]}
            tick={{ fill: "#ededed", fontSize: "0.875rem" }}
            axisLine={{ stroke: "#ededed" }}
            tickLine={{ stroke: "#ededed", strokeWidth: 1 }}
          />
          <Tooltip
            content={(props) => {
              const { payload, label } = props;
              if (payload && payload.length) {
                const { value = 0 } = payload[0];
                return (
                  <StyledTooltip>
                    <div>Time: {new Date(label).toLocaleTimeString()}</div>
                    <div>Value: {value}</div>
                  </StyledTooltip>
                );
              }
              return null;
            }}
          />
          <Legend formatter={() => "Angle (radians)"} />

          <Line
            type="monotone"
            dataKey="value"
            stroke="#007bff"
            strokeWidth={1}
            isAnimationActive={false}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StreamingGraphContainer;
