import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'
import { selectCart } from '../../redux/cart/selectors'
import LogoPizzaSvg from '../../assets/images/logo.svg'
import HeartButton from '../../assets/images/heart.svg'
import Kimchistop from '../../assets/images/Frame 427321805.svg'
import axios, { AxiosRequestConfig } from 'axios'
import { RootState } from '../../redux/store'
import { API_BASE_URL } from '../../config/apiConfig';
export const Header: React.FC = () => {
  const { pathname } = useLocation()
  const { items, totalPrice} = useSelector(selectCart)
  const isMounted = useRef(false)
  const user = useSelector((state: RootState) => state.user.user)
  const [TotalPrice, setTotalPrice] = useState(0)
  const cartRequestOptions:  AxiosRequestConfig ={
    method: "GET",
    url: `${API_BASE_URL}/cart/data`,
    params: { user_id: user?.id },
    headers: {
      "Content-Type": "application/json"}
  }
  async function getCartTotalPrice() {
    try {
      const response = await axios.request(cartRequestOptions)
      setTotalPrice(response.data.totalPrice)
    } catch (error) {
      console.error(error)
    }
  }
  useEffect(() => {
    if (isMounted.current) {
      const json = JSON.stringify(items)
      localStorage.setItem('cart', json)
    }
    isMounted.current = true
    getCartTotalPrice()
  }, [items])

  return (
    <header className='p-3 bg-white rounded-t-[40px] h-20'>
      <div className='flex justify-around'>
          <div className='flex justify-between gap-10'>
            <img  src={LogoPizzaSvg} alt="" />
            <div>
              <img src={Kimchistop} alt="" />
            </div>
            
          </div>
        
      </div>
      {pathname !== 'cart' &&
          (<div className='fixed bottom-0 bg-blue-600 w-full left-0 py-5 rounded-t-2xl z-10'>
            <Link to={'cart'} className='flex items-center justify-center text-white uppercase font-next'>В корзине
              <button className='pl-5'>
                <span className=' text-white'>{TotalPrice} ₽</span>
                <div className=''></div>
              </button>
            </Link>
          </div>)
        }
    </header>
  )
}