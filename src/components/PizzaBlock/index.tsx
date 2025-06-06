import React, { createContext, useContext, useMemo, useRef, useState, startTransition } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectCartItemById } from "../../redux/cart/selectors";
import { CartItem } from "../../redux/cart/types";
import heart_img from "../../assets/images/heart_img.svg";
import heart_active from "../../assets/images/heart.svg";
import { FavItem } from "../../redux/favorite/types_fav";
import { addItem, minusItem, removeItem } from "../../redux/cart/slice";
import { CartItem as CartItemType } from "../../redux/cart/types";
import { HiPlusSm } from "react-icons/hi";
import { HiMinusSm } from "react-icons/hi";
import { removeItemFav } from "../../redux/favorite/favSlice";
import { addItemFav } from "../../redux/favorite/favSlice";
// import { FavoriteContext } from "../../routes/Favorites";
import { GlobalContext } from "../../routes/router";
import './index.css'
import axios, { AxiosRequestConfig } from 'axios';
import { RootState } from "../../redux/store";
import { selectPizzaData } from "../../redux/pizza/selectors";
import { API_BASE_URL } from '../../config/apiConfig';
import { useEffect } from "react";
export type PizzaBlockProps = {
  id: string;
  image: string;
  foodName: string;
  price: number;
  count: number;
  description: string;
  imageSrc: string;
  likeImageSrc: string;
  maxLength?: number;
  category: number;
  quantity: number;
};

export const PizzaBlock: React.FC<PizzaBlockProps> = ({
  id = "0",
  image,
  foodName = "",
  price = 0,
  count = 0,
  description = "",
  maxLength = 9,
  category = 0,
  quantity = 0
}) => {
  const like = useRef(null);
  const dispatch = useDispatch();
  // const { likeItems, setLikeItems } = useContext(FavoriteContext);
  // const [items, setItems] = useState([]);
  // const [favItems, setFavItems] = useState<Pizza[]>([])
  const cartItem = useSelector((state: RootState) =>
    selectCartItemById(id)(state)
  );

  const params = useContext(GlobalContext);
  var [isCounter, setIsCounter] = useState(
    localStorage.getItem("isCounter") === "true"
  );
  const addedCount = cartItem ? cartItem.quantity : 0;
  // const counter = cartItem ? cartItem.isCounter : false;
  const [isHeartActive, setIsHeartActive] = useState(false); ///
  // const [favItems, setFavItems] = useState<Pizza[]>([])
  const user = useSelector((state: RootState)=> state.user.user)
  const [localQuantity, setLocalQuantity] = useState(quantity);
  const { items, status } = useSelector(selectPizzaData);
  const onClickAdd = () => {
    const item: CartItem = {
      id,
      foodName,
      price,
      image,
      description,
      quantity: 1,
    };
    dispatch(addItem(item));
  };

  const getStorageValue = (key: string, defaultValue: any): any => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
      console.error(error);
      return defaultValue;
    }
  };

  const setStorageValue = (key: string, value: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    if (!cartItem) {
      setLocalQuantity(0); // Сбрасываем локальное состояние, если товар удален из корзины
    }
  }, [cartItem]);
  // const [isLiked, setIsLiked] = useState<boolean>(() =>
  //   getStorageValue(`likeButton_${id}`, false)
  // );
  const onClickRemoveFav = () => {
    if (window.confirm("Вы точно хотите удалить товар из избранного?")) {
      dispatch(removeItemFav(id));
      setIsLiked(false);
      setStorageValue(`likeButton_${id}`, !isLiked);
    }
  };
  // const onClickFav = () => {
  //   axios.patch(`https://api.skyrodev.ru/user/${params.user}/fav?favourite_item=${id}`).then(res => {
  //     setLikeItems(res.data)
  //     localStorage.setItem('likeItems', JSON.stringify(res.data))
  //   })

  // }
  const [isLiked, setIsLiked] = useState(() => {
    return JSON.parse(localStorage.getItem(`likeButton_${id}`) || "false");
  });
  
  const options: AxiosRequestConfig = {
    method: 'POST',
    url: `${API_BASE_URL}/cart/add`,
    params: {user_id: user?.id, product_id: id, quantity: 1},
    headers: { 'Content-Type': 'application/json' },
    // data: {product_id: id, quantity: 1,user_id: user?.id}
  };
  
  async function addToCart() {
    try {
      const { data } = await axios.request(options);
      console.log(data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error message:', error.message);
      } else {
        console.error('Unexpected error:', error);
      }
    }
  }

  const decrementToCart = async () => {
    try {
      await axios.request({
        method: 'POST',
        url: `${API_BASE_URL}/cart/add`,
        headers: { 'Content-Type': 'application/json' },
        data: { product_id: id, quantity: -1, user_id: user?.id },
      });
    } catch (error) {
      console.error('Ошибка при добавлении товара:', error);
    }
  };

  const optionsFav: AxiosRequestConfig = {
    method: 'PATCH',
    url: `${API_BASE_URL}/favorites/update`,
    headers: { 'Content-Type': 'application/json' },
    params: {product_id: id, user_id: user?.id}
  };
  async function addToFav() {
    try {
      const { data } = await axios.request(optionsFav);
      // console.log(data.items[0].product_id);
      // console.log(optionsFav.data["product_id"])
      // setLikeItems(optionsFav.data["product_id"]);
      // console.log(likeItems);
      // setLikeItems(data);
      localStorage.setItem("likeItems", JSON.stringify(data));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error message:', error.message);
      } else {
        console.error('Unexpected error:', error);
      }
    }
  }
  

  const onClickFav = () => {
    setIsLiked(!isLiked);
    localStorage.setItem(`likeButton_${id}`, JSON.stringify(!isLiked));
    addToFav();
  };

  // const checkbutton: any = () => {
  //   console.log(`item ${id}`)
  //   console.log(favItems.find((item: any) => item.id === id) ? heart_active : heart_img)
  //   return favItems.find((item: any) => item.id === id) ? heart_active : heart_img
  // }

  const handleClick = () => {
    setIsLiked(!isLiked);
    setStorageValue(`likeButton_${id}`, !isLiked);
  };

  const selectedOptionFav = localStorage.getItem("selectedOptionFav");
  const onClickAddFav = () => {
    const item_fav: FavItem = {
      id,
      foodName,
      price,
      image,
      count: 0,
      description,
      isCounter,
      quantity: 1
    };
    dispatch(addItemFav(item_fav));
    setIsLiked(!isLiked);
    if (!isLiked) {
      setIsLiked(true);
    } else if (isLiked) {
      setIsLiked(false);
      onClickRemoveFav();
    }
  };

  // const handleAddToCart = () => {
  //   const item: CartItem = {
  //     id,
  //     name,
  //     price,
  //     image,
  //     count: addedCount,
  //     description,
  //     isCounter: true,
  //     quantity: 1,
  //   };
  //   dispatch(addItem(item));
  //   if (addedCount > 0) {
  //     isCounter = true;
  //     localStorage.setItem("isCounter", (isCounter === true).toString());
  //   } else {
  //     isCounter = false;
  //     localStorage.setItem("isCounter", (isCounter === false).toString());
  //   }
  //   console.log(isCounter);
  // };
  const onClickPlus = () => {
    startTransition(() => {
      dispatch(
        addItem({
          id,
          foodName,
          price,
          image,
          description,
          quantity: 1,
        })
      );
    });
    addToCart(); // Обновляем сервер
  };

  // const onClickMinus = () => {
  //   startTransition(() => {
  //     if (addedCount === 1) {
  //       onClickRemove();
  //       setIsCounter(false);
  //     }
  //     if (addedCount > 1) dispatch(minusItem(id));
  //   });
  //   decrementToCart(); // Обновляем сервер
  // };
  const onClickMinus = () => {
    if (addedCount > 1) {
      dispatch(minusItem(id));
    } else {
      dispatch(removeItem(id));
    }
  };

  const optionsDelete: AxiosRequestConfig = {
    method: 'DELETE',
    url: 'https://api.skyrodev.ru/docs/cart/delete',
    params: {product_id: id ,user_id: user?.id}
  };

  async function deleteFromCart () {
    try {
      const { data } = await axios.request(optionsDelete);
      console.log(data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error message:', error.message);
      } else {
        console.error('Unexpected error:', error);
      }
    }
  }

  const onClickRemove = () => {
    if (window.confirm("Вы точно хотите удалить товар?")) {
      dispatch(removeItem(id));
    }
    deleteFromCart();
  };

  React.useEffect(() => {
    localStorage.setItem("count", (addedCount ?? 0).toString());
    localStorage.setItem("isCounter", setIsCounter.toString());
  }, [addedCount, isCounter]);
  // React.useEffect(() => {
  //   $(`.like_${id}`).attr("src", checkbutton);
  // }, []);
  const [isTruncated, setIsTruncated] = useState(true);

  // const truncatedText = description.split(' ').slice(0, maxLength).join(' ')
  return (
    <div className="rounded-2xl bg-white pb-3 h-[275px]">
      <Link key={id} to={`/${id}`}>
        <img
          className="w-full h-[160px] rounded-t-2xl object-cover"
          src={image || ""}
          alt="Pizza"
        />
      </Link>
      <div className="flex flex-col px-2 gap-1">
        <div className="h-[70px] mt-1 flex flex-col gap-1">
          <h4 className="text-[12px] font-term leading-4 tracking-widest overflow-hidden whitespace-nowrap text-ellipsis">
            {foodName}
          </h4>
          <span className="text-[7px] leading-tight relative pizza-block-description">
            {description}
          </span>
          <div className="font-term text-grey text-lg text-[#474747] tracking-widest">
            {price}P
          </div>
        </div>
        <div className="">
          <div className="flex justify-between">
            {/* {addedCount > 0 ? (
              <div className="gap-2">
                <button
                  onClick={onClickMinus}
                  className="border-2 border-black rounded-full px-1 py-1"
                >
                  <HiMinusSm />
                </button>
                <span className="font-bold font-next mx-2">{addedCount}</span>
                <button
                  onClick={onClickPlus}
                  className="border-2 border-black rounded-full px-1 py-1"
                >
                  <HiPlusSm />
                </button>
              </div>
            ) : ( */}
              <div>
                <button
                  // onClick={handleAddToCart}
                  onClick={addToCart}
                  className="border-2 border-[#ABABAB] w-[99px] h-[25px] rounded-md landing-1 uppercase font-next text-[10px] font-bold text-center"
                >
                  Добавить
                  {/* {addedCount > 0 && <i className='text-[10px] font-next font-bold bg-black text-white px-[5px] py-[2px] rounded-full ml-2'>{addedCount}</i>} */}
                </button>
              </div>
            {/* )} */}

            {/* <button>
              <img
                alt=""
                ref={like}
                src={checkbutton()}
                onClick={() => {
                  // $(`.like_${id}`).attr("src", checkbutton());
                  addToFav()
                  document.querySelectorAll(`.like_${id}`).forEach(el => {
                    el.setAttribute("src", checkbutton());
                  });                  
                }}
                className={`like_${id} w-[25px] h-[25px] top-[0px] relative`}
              />
            </button> */}
            {/* <button>
                  <img
                    alt=""
                    src={checkbutton()}
                    onClick={() => {
                      // Меняем состояние сердечка
                      setIsHeartActive(!isHeartActive);
                    }}
                    className="like w-[25px] h-[25px] top-[0px] relative"
                  />
                </button> */}
            <div className="heart-container" title="Like">
              <input type="checkbox" className="checkbox" checked={isLiked} id="Give-It-An-Id"     onChange={() => {
      onClickFav();
      setIsLiked(!isLiked); // обновление состояния isLiked при каждом клике
    }} />
              {/* <input
                type="checkbox"
                className="checkbox"
                id="Give-It-An-Id"
                checked={favItems.find((item: any) => item.id === id) ? true : false}
                onChange={() => addToFav()}
              /> */}
              <div className="svg-container">
                <svg
                  viewBox="0 0 24 24"
                  className="svg-outline"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Zm-3.585,18.4a2.973,2.973,0,0,1-3.83,0C4.947,16.006,2,11.87,2,8.967a4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,11,8.967a1,1,0,0,0,2,0,4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,22,8.967C22,11.87,19.053,16.006,13.915,20.313Z"></path>
                </svg>
                <svg
                  viewBox="0 0 24 24"
                  className="svg-filled"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Z"></path>
                </svg>
                <svg
                  className="svg-celebrate"
                  width="100"
                  height="100"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <polygon points="10,10 20,20"></polygon>
                  <polygon points="10,50 20,50"></polygon>
                  <polygon points="20,80 30,70"></polygon>
                  <polygon points="90,10 80,20"></polygon>
                  <polygon points="90,50 80,50"></polygon>
                  <polygon points="80,80 70,70"></polygon>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
