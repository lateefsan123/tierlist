function Row({item, color, settings, Setsettings, deleteRow}) {
    

    function toggleSettings() {
  Setsettings(!settings);

  
}



window.onclick = function (event) {
  if (event.target == settings) {
    Setsettings(false);
  }
};


    return (
        <div className="item">
                      <div className="name" style={{backgroundColor: color}}>{item}</div>
                      <div className="middle"></div>
                      <div className="right">
                        <div className='edit'><i className="fa-solid fa-gear" onClick={toggleSettings}></i></div>
                        <div className='switch'><i className="fa-solid fa-x" onClick={deleteRow}></i></div>
                      </div>
        </div>

    );
}
    
    
    
    


export default Row;