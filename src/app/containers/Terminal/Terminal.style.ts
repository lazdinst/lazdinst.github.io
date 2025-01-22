import styled from "styled-components";

export const TerminalContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.surfaces.footer};
`;
