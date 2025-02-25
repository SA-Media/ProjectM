import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { theme } from '../styles/theme';

// Adding animation keyframes
const fadeInUpAnimation = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Animated section
const AnimatedSection = styled.div`
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
  
  &.animated {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Updated styling with bold borders and vibrant colors
const LandingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', sans-serif;
`;

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
  border-bottom: 2px solid black;
  background-color: rgba(122, 201, 192, 0.9);
  backdrop-filter: blur(5px);
`;

const HeaderContent = styled.div`
  display: flex;
  height: 70px;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  justify-content: space-between;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
`;

const LogoText = styled.span`
  font-family: 'Courier', monospace;
  font-weight: bold;
  font-size: 1.5rem;
  color: #000;
`;

const NavLinks = styled.nav`
  display: flex;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  font-size: 0.875rem;
  font-weight: 500;
  color: #000;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
    text-underline-offset: 4px;
  }
`;

const HeroSection = styled.section`
  background-color: #E0FFF0;
  padding: 6rem 1rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='1' fill='%23000' fill-opacity='0.1' /%3E%3C/svg%3E");
    transform: rotate(45deg);
    z-index: 0;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  position: relative;
  z-index: 1;
`;

const HeroTitle = styled.h1`
  font-family: 'Courier', monospace;
  font-weight: bold;
  font-size: clamp(2.5rem, 5vw, 4rem);
  color: #000;
  margin-bottom: 1.5rem;
`;

const Tagline = styled.p`
  font-size: 1.25rem;
  color: #333;
  max-width: 800px;
  margin: 0 auto 3rem;
`;

const CTAButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const PrimaryButton = styled(Link)`
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border: 2px solid black;
  border-radius: 6px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: 1rem;
  background-color: ${theme.colors.primary.teal};
  color: white;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const SecondaryButton = styled(Link)`
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border: 2px solid black;
  border-radius: 6px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  font-size: 1rem;
  background-color: white;
  color: #000;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const FeaturesSection = styled.section`
  background-color: #F0FFF4;
  padding: 5rem 1rem;
`;

const SectionTitle = styled.h2`
  font-family: 'Courier', monospace;
  font-weight: bold;
  font-size: 2.5rem;
  color: #000;
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  
  &::after {
    content: '';
    display: block;
    width: 60px;
    height: 4px;
    background: ${theme.colors.primary.teal};
    margin: 20px auto 0;
    border-radius: 2px;
  }
`;

const FeatureCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2.5rem;
`;

const FeatureCard = styled.div`
  background: white;
  border: 2px solid black;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
`;

const FeatureIconContainer = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: #98FB98;
  margin-bottom: 1.5rem;
  border: 2px solid black;
  font-size: 2rem;
`;

const FeatureTitle = styled.h3`
  font-weight: bold;
  font-size: 1.25rem;
  margin-bottom: 1rem;
`;

const FeatureText = styled.p`
  color: #555;
  line-height: 1.6;
`;

const AboutSection = styled.section`
  background-color: white;
  padding: 5rem 1rem;
`;

const AboutContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const AboutText = styled.div`
  line-height: 1.8;
  margin-bottom: 3rem;
`;

const FoundersSection = styled.div`
  margin-top: 4rem;
`;

const FounderCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const FounderCard = styled.div`
  background: white;
  border: 2px solid black;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const FounderName = styled.h4`
  font-weight: bold;
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
`;

const FounderRole = styled.div`
  color: ${theme.colors.primary.teal};
  font-weight: 500;
  margin-bottom: 1rem;
`;

const FounderBio = styled.p`
  color: #555;
  line-height: 1.6;
  text-align: left;
`;

const CTASection = styled.section`
  background-color: #98FB98;
  padding: 4rem 1rem;
  text-align: center;
`;

const CTAForm = styled.form`
  display: flex;
  max-width: 500px;
  margin: 2rem auto 0;
  gap: 0.5rem;
  
  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const CTAInput = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 2px solid black;
  border-radius: 6px;
  font-size: 1rem;
`;

const Footer = styled.footer`
  background-color: #F0FFF4;
  padding: 2rem 1rem;
  border-top: 2px solid black;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
`;

function LandingPage() {
  // Create refs for animation
  const featuresRef = useRef(null);
  const featureCardsRef = useRef([]);
  const aboutRef = useRef(null);
  const foundersRef = useRef(null);
  const ctaRef = useRef(null);
  
  useEffect(() => {
    // Animation observer
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };
    
    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
        }
      });
    };
    
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    // Observe all refs
    if (featuresRef.current) observer.observe(featuresRef.current);
    featureCardsRef.current.forEach(card => {
      if (card) observer.observe(card);
    });
    if (aboutRef.current) observer.observe(aboutRef.current);
    if (foundersRef.current) observer.observe(foundersRef.current);
    if (ctaRef.current) observer.observe(ctaRef.current);
    
    return () => observer.disconnect();
  }, []);
  
  // Add animation keyframes
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = fadeInUpAnimation;
    document.head.appendChild(style);
    
    return () => document.head.removeChild(style);
  }, []);
  
  return (
    <LandingContainer>
      <Header>
        <HeaderContent>
          <Logo to="/">
            <div 
              style={{
                width: 40,
                height: 40,
                backgroundColor: theme.colors.primary.yellow,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                border: '2px solid black'
              }}
            >
              SB
            </div>
            <LogoText>SEO Backlink Builder</LogoText>
          </Logo>
          
          <NavLinks>
            <NavLink to="/app#features">Features</NavLink>
            <NavLink to="/app#about">About Us</NavLink>
            <NavLink to="/app#contact">Contact</NavLink>
          </NavLinks>
          
          <PrimaryButton to="/app" style={{ padding: '0.5rem 1rem' }}>
            Get Started
          </PrimaryButton>
        </HeaderContent>
      </Header>

      <HeroSection>
        <Container>
          <HeroTitle>Find and Fix Your SEO Problems in Minutes</HeroTitle>
          <Tagline>
            The all-in-one SEO solution for businesses struggling to improve their online visibility.
          </Tagline>
          <CTAButtons>
            <PrimaryButton to="/app">Get Started Free</PrimaryButton>
            <SecondaryButton to="/app">See Demo</SecondaryButton>
          </CTAButtons>
        </Container>
      </HeroSection>

      <FeaturesSection>
        <Container>
          <AnimatedSection ref={featuresRef}>
            <SectionTitle>Powerful Features to Boost Your SEO</SectionTitle>
          </AnimatedSection>
          
          <FeatureCards>
            {[
              {
                icon: "📈",
                title: "Backlinks Finder",
                text: "Discover high-quality backlink opportunities that your competitors are missing, helping you climb search rankings faster."
              },
              {
                icon: "🔍",
                title: "SEO Analyzer",
                text: "Get actionable insights on your website's SEO performance with our comprehensive analysis tool that identifies critical issues and opportunities."
              },
              {
                icon: "✉️",
                title: "Email CRM",
                text: "Coming Soon! Manage your outreach campaigns efficiently with our integrated email CRM system designed for SEO professionals."
              }
            ].map((feature, index) => (
              <AnimatedSection 
                key={index}
                ref={el => featureCardsRef.current[index] = el}
                style={{ 
                  animationDelay: `${index * 0.2}s`,
                  transition: `opacity 0.6s ease-out ${index * 0.2}s, transform 0.6s ease-out ${index * 0.2}s`
                }}
              >
                <FeatureCard>
                  <FeatureIconContainer>{feature.icon}</FeatureIconContainer>
                  <FeatureTitle>{feature.title}</FeatureTitle>
                  <FeatureText>{feature.text}</FeatureText>
                </FeatureCard>
              </AnimatedSection>
            ))}
          </FeatureCards>
        </Container>
      </FeaturesSection>

      <AboutSection>
        <Container>
          <AnimatedSection ref={aboutRef}>
            <SectionTitle>About Us</SectionTitle>
            
            <AboutContent>
              <AboutText>
                <p>
                  SEO Backlink Builder was founded with a simple mission: to make high-quality 
                  backlink building accessible to businesses of all sizes. We understand the 
                  challenges of improving search visibility in an increasingly competitive 
                  digital landscape.
                </p>
                <p style={{ marginTop: '1rem' }}>
                  Our tools are designed by SEO professionals who have faced the same challenges 
                  you're experiencing. We've combined our expertise in search engine optimization, 
                  content analysis, and outreach automation to create a solution that delivers 
                  real results.
                </p>
              </AboutText>
            </AboutContent>
          </AnimatedSection>
          
          <AnimatedSection 
            ref={foundersRef}
            style={{ 
              transition: 'opacity 0.6s ease-out 0.2s, transform 0.6s ease-out 0.2s'
            }}
          >
            <FoundersSection>
              <h3 style={{ 
                textAlign: 'center', 
                marginBottom: '2rem',
                fontSize: '1.75rem',
                fontFamily: 'Courier, monospace',
                fontWeight: 'bold'
              }}>Our Founders</h3>
              
              <FounderCards>
                <FounderCard>
                  <FounderName>Saim</FounderName>
                  <FounderRole>Co-founder</FounderRole>
                  <FounderBio>
                    With expertise in software development and SEO algorithms, Saim leads the 
                    technical development of our platform. His innovative approach to analyzing 
                    search patterns has been instrumental in creating our powerful SEO tools.
                  </FounderBio>
                </FounderCard>
                
                <FounderCard>
                  <FounderName>Mounir</FounderName>
                  <FounderRole>Co-founder</FounderRole>
                  <FounderBio>
                    Mounir brings years of experience in digital marketing and business growth 
                    strategies. His vision for making enterprise-level SEO accessible to all 
                    businesses drives our product development and company mission.
                  </FounderBio>
                </FounderCard>
              </FounderCards>
            </FoundersSection>
          </AnimatedSection>
        </Container>
      </AboutSection>

      <CTASection>
        <Container>
          <AnimatedSection ref={ctaRef}>
            <h2 style={{ 
              fontSize: '2.5rem', 
              fontFamily: 'Courier, monospace',
              fontWeight: 'bold',
              marginBottom: '1.5rem'
            }}>
              Ready to Boost Your SEO?
            </h2>
            <p style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
              Join thousands of businesses using SEO Backlink Builder to improve their search ranking and drive more traffic.
            </p>
            
            <CTAForm>
              <CTAInput type="email" placeholder="Enter your email" />
              <PrimaryButton to="/app" as="button" style={{ border: '2px solid black' }}>
                Get Started
              </PrimaryButton>
            </CTAForm>
          </AnimatedSection>
        </Container>
      </CTASection>

      <Footer>
        <FooterContent>
          <p>© {new Date().getFullYear()} SEO Backlink Builder. All rights reserved.</p>
        </FooterContent>
      </Footer>
    </LandingContainer>
  );
}

export default LandingPage; 