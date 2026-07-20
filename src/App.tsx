import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Catalogue } from './components/sections/Catalogue'
import { Contact } from './components/sections/Contact'
import { Delivery } from './components/sections/Delivery'
import { Hero } from './components/sections/Hero'
import { Sourcing } from './components/sections/Sourcing'
import { WhoWeSupply } from './components/sections/WhoWeSupply'
import { Footer } from './components/layout/Footer'
import { Header } from './components/layout/Header'

const CONTACT_HASH = '#/contact'

function currentRoute(): 'contact' | 'home' {
  return typeof window !== 'undefined' && window.location.hash === CONTACT_HASH ? 'contact' : 'home'
}

function App() {
  const { t } = useTranslation()
  const [route, setRoute] = useState<'contact' | 'home'>(currentRoute)

  // Minimal hash router: #/contact renders the Contact page, everything else is
  // the home scroll. Other nav items keep their #anchor hrefs and simply route
  // back to home (the effect below scrolls to the anchor once home has rendered).
  useEffect(() => {
    const onHash = () => setRoute(currentRoute())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    if (route === 'contact') {
      window.scrollTo({ top: 0, behavior: 'auto' })
      return
    }
    const id = window.location.hash.slice(1)
    if (id && id !== '/contact') document.getElementById(id)?.scrollIntoView()
  }, [route])

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-btn focus:bg-cream focus:px-5 focus:py-2.5 focus:text-ui focus:text-ink focus:shadow-sheet"
      >
        {t('common.skipToContent')}
      </a>
      <Header />
      <main id="main-content">
        {route === 'contact' ? (
          <Contact />
        ) : (
          <>
            <Hero />
            <Catalogue />
            <Sourcing />
            <WhoWeSupply />
            <Delivery />
          </>
        )}
      </main>
      <Footer />
    </>
  )
}

export default App
