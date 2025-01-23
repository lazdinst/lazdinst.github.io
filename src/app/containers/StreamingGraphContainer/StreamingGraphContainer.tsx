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
  jointData: { time: number; value: number; name: string }[]; // Data type for joint position values
};

const StreamingGraphContainer: React.FC<StreamingGraphContainerProps> = ({
  jointData,
}) => {
  console.log(jointData);

  return (
    <div style={{ width: "100%", height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={jointData}>
          <CartesianGrid />
          <XAxis dataKey="time" />
          <YAxis />
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
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#8884d8"
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StreamingGraphContainer;
