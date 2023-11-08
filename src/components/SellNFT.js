async function disableButton() {
    const listButton = document.getElementById("list-button")
    listButton.disabled = true
    listButton.style.backgroundColor = "grey";
    listButton.style.opacity = 0.3;
}

async function enableButton() {
    const listButton = document.getElementById("list-button")
    listButton.disabled = false
    listButton.style.backgroundColor = "#A500FF";
    listButton.style.opacity = 1;
}

//This function uploads the NFT image to IPFS
async function OnChangeFile(e) {
    var file = e.target.files[0];
    //check for file extension
    try {
        //upload the file to IPFS
        disableButton();
        updateMessage("Uploading image.. please dont click anything!")
        const response = await uploadFileToIPFS(file);
        if(response.success === true) {
            enableButton();
            updateMessage("")
            console.log("Uploaded image to Pinata: ", response.pinataURL)
            setFileURL(response.pinataURL);
        }
    }
    catch(e) {
        console.log("Error during file upload", e);
    }
}

//This function uploads the metadata to IPFS
async function uploadMetadataToIPFS() {
    const {name, description, price} = formParams;
    //Make sure that none of the fields are empty
    if( !name || !description || !price || !fileURL)
    {
        updateMessage("Please fill all the fields!")
        return -1;
    }

    const nftJSON = {
        name, description, price, image: fileURL
    }

    try {
        //upload the metadata JSON to IPFS
        const response = await uploadJSONToIPFS(nftJSON);
        if(response.success === true){
            console.log("Uploaded JSON to Pinata: ", response)
            return response.pinataURL;
        }
    }
    catch(e) {
        console.log("error uploading JSON metadata:", e)
    }
}

async function listNFT(e) {
    e.preventDefault();

    //Upload data to IPFS
    try {
        const metadataURL = await uploadMetadataToIPFS();
        if(metadataURL === -1)
            return;
        //After adding your Hardhat network to your metamask, this code will get providers and signers
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        disableButton();
        updateMessage("Uploading NFT(takes 5 mins).. please dont click anything!")

        //Pull the deployed contract instance
        let contract = new ethers.Contract(Marketplace.address, Marketplace.abi, signer)

        //massage the params to be sent to the create NFT request
        const price = ethers.utils.parseUnits(formParams.price, 'ether')
        let listingPrice = await contract.getListPrice()
        listingPrice = listingPrice.toString()

        //actually create the NFT
        let transaction = await contract.createToken(metadataURL, price, { value: listingPrice })
        await transaction.wait()

        alert("Successfully listed your NFT!");
        enableButton();
        updateMessage("");
        updateFormParams({ name: '', description: '', price: ''});
        window.location.replace("/")
    }
    catch(e) {
        alert( "Upload error"+e )
    }
}