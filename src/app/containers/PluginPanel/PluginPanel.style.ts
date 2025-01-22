import styled from "styled-components";

export const PluginPanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.surfaces.sidebar};
`;
