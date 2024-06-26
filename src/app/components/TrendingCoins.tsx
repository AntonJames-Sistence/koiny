'use client';
import ReusableTile from "./ReusableTile";
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import toast, { Toaster } from "react-hot-toast";
import { CircularProgress, Button } from "@mui/material";
import { useAuth } from "./Auth/AuthContext";

interface Coin {
    id: string,
    name: string,
    symbol: string,
    image: string,
    sparkline: string,
    price_change_percentage_24h: string;
}

const TrendingCoins: React.FC = () => {
    const [trendingCoins, setTrendingCoins] = useState<Coin[]>([]);;
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    // State of the user
    const { authState } = useAuth();

    useEffect(() => {
        fetchTrendingCoins();
    }, []);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, coinId: string) => {
        e.preventDefault();
        router.push(`/?coin=${coinId}`);
    };

    const fetchTrendingCoins = async () => {
        const url = 'api/trending'

        try {
            const response = await fetch(url);
            const data = await response.json();
            let topThree = data.slice(0, 5);
            setTrendingCoins(topThree);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const hadleUpdateDB = async () => {
        setLoading(true);

        try {
            // Update trending coins
            await fetch('api/trending', {
                method: 'PUT'
            });
            // Udate news
            await fetch('api/news', {
                method: 'PUT'
            });

            fetchTrendingCoins();
            toast.success("Trending Coins are up-to-date");
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ReusableTile title="Trending Coins (24h)">
            {!loading ? (
                <div className="flex flex-col -mt-4">
                    {trendingCoins.map((coin, idx) => {
                        const priceChange = parseFloat(coin.price_change_percentage_24h);
                        const isNegative = priceChange < 0;
                        return (
                            <a className={`rounded-lg ${isNegative ? 'hover-red' : 'hover-green'} ease-in-out duration-200 h-[200%] mb-4 cursor-pointer "`}
                                onClick={(e) => handleClick(e, coin.id)} 
                                key={idx}>
                                <div className="flex justify-between p-2">
                                    <div className="flex self-center">
                                        <img className="h-6 w-6 rounded-full" src={coin.image} alt={`${coin.name} image`} />
                                        <div className="flex self-center ml-2 font-[400]">
                                            <p>{coin.name}</p>
                                            <p className="ml-1">{`(${coin.symbol})`}</p>
                                        </div>
                                    </div>

                                    <div className={`flex flex-row bg-${isNegative ? 'red' : 'green'}-100 bg-opacity-50 rounded-md max-w-[100px] px-6 py-1 text-${isNegative ? 'red' : 'green'}-600 self-center text-sm`}>
                                        <div className={`triangle-${isNegative ? 'red' : 'green'} self-center border-${isNegative ? 'red' : 'green'} mr-1`}></div>
                                        <div>{`${priceChange.toFixed(2)}%`}</div>
                                    </div>
                                </div>
                            </a>
                        );
                    })}
                    <Button 
                        variant="contained" 
                        sx={{
                            mx: 'auto',
                            '&.MuiButton-root': {
                                borderRadius: '10px'
                            },}} 
                        onClick={hadleUpdateDB}
                        disabled={!authState.isAuthenticated} // Disable button if user is logged out
                    >
                    Update Prices
                    </Button>
                </div>
            ) : (
                <div className="self-center text-black"><CircularProgress /></div>
            )}
        </ReusableTile>
    )
}

export default TrendingCoins;