interface CardProps{
    card: {
        name: string;
        type: string;
        card_images: {image_url: string}[];
    };
}

export const YgoCard = ({card}: CardProps) => {
    return (
        <div style={{border: '1px solid #ccc',
        padding: '10px', borderRadius: '8px', textAlign: 'center'}}>
            <img
                src={card.card_images[0].image_url}
                alt={card.name}
                style={{width:'100%', borderRadius:'8px'}}
            />
            <h4 style={{fontSize: '14px', marginTop:'10px'}}>
                {card.name}
            </h4>
            <p style={{fontSize:'12px', color:'#666'}}>
                {card.type}
            </p>
        </div>
    );
};