import React from 'react'
import Hero from '../components/Hero'
import HowItWorks from '../components/HowItWorks'
import Features from '../components/Features'
import WhyItMatters from '../components/WhyItMatters'
import ModelPerformance from '../components/ModelPerformance'
import Explainability from '../components/Explainability'
import TargetUsers from '../components/TargetUsers'
import CTA from '../components/CTA'
import Footer from '../components/Footer'

const Home = () => {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Features />
      <WhyItMatters />
      <ModelPerformance />
      <Explainability />
      <TargetUsers />
      <CTA />
      <Footer />
    </>
  )
}

export default Home