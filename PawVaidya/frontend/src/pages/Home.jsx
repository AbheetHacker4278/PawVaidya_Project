import React from 'react'
import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import Banner from '../components/Banner'
import AnimalHealthChatbot from '../components/AnimalHealthChatbot'
import PawBackground from '../components/PawBackground'

export const Home = () => {
  return (
    <div className="relative">
      <PawBackground density="normal" />
      <Header />
      <SpecialityMenu />
      <TopDoctors />
      <Banner />
      <AnimalHealthChatbot />
    </div>
  )
}

export default Home