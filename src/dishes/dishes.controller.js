const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function list(req,res){
  res.json({data: dishes});
};

function read(req,res,next){
  res.json({data: res.locals.dish});
};

function bodyHasName(req,res,next){
  const {data:{name} = {}} = req.body;
  if(name){
    return next();
  }else{
    next({
      status:400,
      message:"Dish must include a name"
    });
  };
};

function bodyHasDescription(req,res,next){
  const {data:{description} = {}} = req.body;
  if(description){
    return next();
  }else{
    next({
      status:400,
      message:"Dish must include a description"
    });
  };
};

function bodyHasPrice(req,res,next){
  const {data:{price} = {}} = req.body;
  if(price){
    return next();
  }else{
    next({
      status:400,
      message:"Dish must include a price"
    });
  };
};

function bodyHasImg(req,res,next){
  const {data:{image_url} = {}} = req.body;
  if(image_url){
    return next();
  }else{
    next({
      status:400,
      message:"Dish must include a image_url"
    });
  };
};

function bodyHasValidPrice(req,res,next){
  const {data:{price}}= req.body;
  if(Number.isInteger(price)&&price>0){
    return next();
  }else{
    next({
      status:400,
      message: "Dish must have a price that is an integer greater than 0"
    });
  }
};

function create(req,res,next){
  const {data:{name, description, price, image_url}={}} = req.body;
  const newDish = {
    id: nextId(),
    name:name,
    description:description,
    price:price,
    image_url:image_url,
  };
  dishes.push(newDish);
  res.status(201).json({data: newDish });
}

function dishExists(req,res,next){
  const {dishId} = req.params;
  const foundDish = dishes.find((dish)=> dish.id === dishId);
  if (foundDish){
    res.locals.dish = foundDish;
    next();
  }else{
    next({
      status:404,
      message: `Dish does not exist: ${dishId}.`
    });
  };
};

function dishIdMatchesDataId(req,res,next){
  const {dishId} = req.params;
  const {data:{id}} = req.body;
  if (id){
    if(dishId === id){
   next();
  }else{
    next({
      status:400,
      message:`Dish id does not match route id. Dish, ${id}, Route:${dishId}`
    });
  };
  }
  next();
};

function update(req,res,next){
  const dish = res.locals.dish;
  const {data:{name,description,price,image_url} = {}}= req.body;

  dish.name = name;
  dish.description = description;
  dish.price = price;
  dish.image_url = image_url;

  res.json({data:dish});

};

 
module.exports={
  list,
  read:[dishExists, read],
  create:[bodyHasName, bodyHasDescription, bodyHasPrice, bodyHasValidPrice, bodyHasImg, create],
  update:[dishExists, dishIdMatchesDataId, bodyHasName, bodyHasDescription, bodyHasPrice, bodyHasValidPrice, bodyHasImg, update],
};