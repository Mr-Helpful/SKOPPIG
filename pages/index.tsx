import { useState } from 'react'
import Head from 'next/head'

import NodeModal from '../src/BrushModal/NodeModal'

export default function Home() {
  const [menuElem, setMenuElem] = useState<HTMLElement>(null)

  return (
    <div>
      <Head>
        <title>Skoppig</title>
        <meta name="description" content="Paint Project" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div
          onClick={ev => setMenuElem(ev.target as HTMLElement)}
          style={{
            width: '60px',
            height: '60px',
            backgroundColor: 'blue'
          }}
        >
          Get menu
        </div>
        <NodeModal elem={menuElem} close={() => setMenuElem(null)} />
      </main>
    </div>
  )
}
