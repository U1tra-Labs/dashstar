import React, { useState, useEffect } from 'react';

const VaultInfo = () => {
    const [averageApy, setAverageApy] = useState(null);
    const [usdRate, setUsdRate] = useState(null);
    const [closestApy, setClosestApy] = useState(null);
    const [netApy, setNetApy] = useState(null);
  
    useEffect(() => {
      fetch('https://merv2-api.mercurial.finance/vault_info')
        .then(response => response.json())
        .then(data => {
          setAverageApy(data.average_apy);
          setUsdRate(data.usd_rate);
          setClosestApy(data.closest_apy);
          setNetApy(data.net_apy);
        })
        .catch(error => console.error('Error fetching data:', error));
    }, []);
  
    // Your component rendering logic...
  };
  
  export default VaultInfo;