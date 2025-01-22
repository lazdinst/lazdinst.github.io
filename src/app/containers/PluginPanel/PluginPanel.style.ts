import styled from "styled-components";

export const PluginPanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.surfaces.sidebar};
  min-width: 200px;
`;

export const PluginTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.5rem;
  margin: 0.5rem 1rem;
  white-space: nowrap;
  min-width: 100px;
`;
