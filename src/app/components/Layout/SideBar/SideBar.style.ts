import styled from "styled-components";

export const SideBarContainer = styled.div`
  width: 300px;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.surfaces.sidebar};
  color: white;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
`;

export const Title = styled.h2`
  margin: 0 0 1rem;
  font-size: 1rem;
  text-align: center;
`;
