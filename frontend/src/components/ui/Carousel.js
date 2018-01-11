import React, { Component } from 'react';
import Slider from 'react-slick';

import { Image } from 'semantic-ui-react'

import poker_01 from "../../images/poker_01.png";
import poker_02 from "../../images/poker_02.png";

class Carousel extends Component {
    render() {
        const settings = {
            dots: true,
            infinite: true,
            speed: 500,
            slidesToShow: 1,
            slidesToScroll: 1,
            autoplay: true
          };
        return (
            
                <Slider {...settings} style={{ marginTop: '5em'}} >
                    <div><Image src={poker_01} centered size='massive'/></div>
                    <div><Image src={poker_02} centered size='massive'/></div>
                </Slider>
        );
    }
}

export default Carousel;