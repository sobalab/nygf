import { useTranslation } from 'react-i18next'
import { AvailabilityBoard } from './components/sections/AvailabilityBoard'
import { Catalogue } from './components/sections/Catalogue'
import { Delivery } from './components/sections/Delivery'
import { Hero } from './components/sections/Hero'
import { Sourcing } from './components/sections/Sourcing'
import { WhoWeSupply } from './components/sections/WhoWeSupply'
import { Footer } from './components/layout/Footer'
import { Header } from './components/layout/Header'

function App() {
  const { t } = useTranslation()

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-paper focus:px-4 focus:py-2 focus:font-sans focus:text-xs focus:uppercase focus:tracking-widest2 focus:text-ink"
      >
        {t('common.skipToContent')}
      </a>
      <Header />
      <main id="main-content">
        <Hero />
        <AvailabilityBoard />
        <Catalogue />
        <Sourcing />
        <WhoWeSupply />
        <Delivery />
      </main>
      <Footer />
    </>
  )
}

export default App
