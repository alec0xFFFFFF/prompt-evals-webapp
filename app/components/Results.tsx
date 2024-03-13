import React, {useEffect} from 'react';

interface ResultsProps {
    data: any;
    navigation: any;
}

export default function Results({data, navigation}: ResultsProps) {
  const [currentRun, setCurrentRun] = React.useState(0);
  useEffect(() => {
      console.log("data changed");
      console.log(data);
  }, [data])
  return (
    <>

    </>
  );
}
