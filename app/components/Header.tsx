interface Props{
  title:string,
  description:string
}

import React from 'react'
import { useLocation } from 'react-router'
import { cn } from '~/lib/utils'

const Header = ({title, description}:Props) => {
const location = useLocation()

  return (
    <div className='header'>
      <article>
        <h1 className={cn("text-dark-100", location.pathname==='/' ? 'text-2xl md:text-4xl font-bold':'text-xl md:text-2xl font-semibold')}>
          {title}
        </h1>
        <p className={cn("text-gray-100 font-normal", location.pathname==='/' ? 'text-base md:text-lg':'text-sm md:text-lg')}>
          {description}
        </p>
      </article>
    </div>
  )
}

export default Header