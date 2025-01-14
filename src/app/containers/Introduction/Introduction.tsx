import React from "react";
import styled from "styled-components";
import { introductionContent } from "./contentMapping";

const IntroductionWrapper = styled.div`
  padding: ${({ theme }) => theme.spacing.medium}px;
  background-color: ${({ theme }) => theme.colors.surfaces.card};
  border-radius: 10px;
  box-shadow: ${({ theme }) => theme.components.panel.shadow};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.large};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Subtitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.medium};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.small};
  color: ${({ theme }) => theme.colors.text.muted};
`;

const ContactInfo = styled.div`
  margin-top: ${({ theme }) => theme.spacing.large}px;
  p {
    font-size: ${({ theme }) => theme.typography.fontSize.small};
    color: ${({ theme }) => theme.colors.text.primary};
  }
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
  }
`;

const Introduction: React.FC = () => {
  return (
    <IntroductionWrapper>
      <Title>{introductionContent.name}</Title>
      <Subtitle>{introductionContent.title}</Subtitle>
      <Description>{introductionContent.description}</Description>
      <ContactInfo>
        <p>
          Email:{" "}
          <a href={`mailto:${introductionContent.contactInfo.email}`}>
            {introductionContent.contactInfo.email}
          </a>
        </p>
        <p>
          Phone:{" "}
          <a href={`tel:${introductionContent.contactInfo.phone}`}>
            {introductionContent.contactInfo.phone}
          </a>
        </p>
      </ContactInfo>
    </IntroductionWrapper>
  );
};

export default Introduction;
