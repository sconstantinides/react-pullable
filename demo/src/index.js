import React from 'react';
import { render } from 'react-dom';

import PreloadImage from './PreloadImage';
import Pullable from '../../src';

class Demo extends React.Component {
  images = [
		'https://upload.wikimedia.org/wikipedia/commons/a/a5/Ailurus_fulgens_-_Syracuse_Zoo.jpg',
		'https://upload.wikimedia.org/wikipedia/commons/7/71/Red_Panda_NY.JPG',
		'https://upload.wikimedia.org/wikipedia/commons/b/bf/Red_Panda_c.jpg',
		'https://upload.wikimedia.org/wikipedia/commons/c/c1/Hydrochoeris_hydrochaeris_Zoo_Praha_2011-1.jpg',
		'https://upload.wikimedia.org/wikipedia/commons/b/bc/Capybara_Hattiesburg_Zoo_%2870909b-58%29_2560x1600.jpg',
		'https://upload.wikimedia.org/wikipedia/commons/d/de/Capybara_Hattiesburg_Zoo_%2870909b-42%29_2560x1600.jpg'
	];

  captions = [
    "Pull the cards down and get another! Works on touch devices & emulators.",
    "Whoa! Pretty cool, huh?",
    "Hot damn, that’s a cute animal.",
    "I don’t know about you but I could do this all day..."
  ];

	constructor(props) {
		super(props);

		this.state = {
			cards: [
				{
					num: 0,
					image: this.images[0],
          caption: this.captions[0]
				}
			]
		};
	}

	addCard = () => {
		setTimeout(() => {
			this.setState(state => {
				const cards = state.cards;
				const newCard = {
					num: cards.length,
					image: this.images[cards.length % this.images.length],
					caption: this.captions[cards.length % this.captions.length]
				};
				cards.unshift(newCard);

				return {
					cards: cards
				};
			});
		}, 800); // Pretend to actually fetch data
	};

  render() {
    return (
			<React.Fragment>
				<nav
					className="navbar navbar-dark bg-primary"
					style={{ boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)' }}
				>
					<h1 className="navbar-brand mb-0 pb-0">🙋 React Pullable</h1>
					<span className="navbar-text text-white">
						Simple, customizable pull to refresh for touch devices.&nbsp;
						<a href="https://github.com/sconstantinides/react-pullable" target="_blank"><u>View the docs on GitHub</u></a>
					</span>
				</nav>

				<div style={{
					maxWidth: '600px',
					margin: '0 auto'
				}}>
					<Pullable
						onRefresh={this.addCard}
						spinnerOffset={10}
					>
						{this.state.cards.map(card => {
							return (
								<div key={card.num} className="card m-3">
									<PreloadImage
										style={{
											position: 'relative',
											width: '100%',
											height: '200px',
											backgroundColor: '#222222'
										}}
										src={card.image}
									/>
									<div className="card-body">
										<h5 className="card-title">Card {card.num + 1}</h5>
										<p className="card-text">{card.caption}</p>
									</div>
								</div>
							);
						})}
					</Pullable>
				</div>
			</React.Fragment>
		);
	}
}

render(<Demo/>, document.querySelector('#demo'));
