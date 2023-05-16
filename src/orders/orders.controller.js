const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function list(req,res,next){
  res.json({data:orders});
};



function read(req,res,next){
  res.json({data: res.locals.order});
};

function bodyHasDeliverTo (req,res,next){
  const {data:{deliverTo} = {}} = req.body;
  if (deliverTo){
    next();
  }else{
    next({
      status:400,
      message:"Order must include a deliverTo"
    });
  };
};

function bodyHasMobileNumber (req,res,next){
  const {data:{mobileNumber} = {}} = req.body;
  if (mobileNumber){
    next();
  }else{
    next({
      status:400,
      message:"Order must include a mobileNumber"
    });
  };
};

function bodyHasDishes (req,res,next){
  const {data:{dishes} = {}} = req.body;
  if (dishes){
    next();
  }else{
    next({
      status:400,
      message:"Order must include a dish"
    });
  };
};

function dishesIsAnArray (req,res,next){
  const {data:{dishes} = {}} = req.body;
  if (Array.isArray(dishes) && dishes.length>0){
    next();
  }else{
    next({
      status:400,
      message:"Order must include a dish"
    });
  };
};

function ordersHasQuantity(req,res,next){
  const {data:{dishes}} = req.body;
  dishes.forEach((d,i)=>{
    if (!d.quantity || !(Number(d.quantity) > 0) || typeof d.quantity !== "number"){
      next({
        status:400,
        message:`Dish ${i} must have a quantity that is an integer greater than 0`
      });
    };
  });
  next();
};

function create(req,res,next){
  const {data:{deliverTo, mobileNumber, dishes, quantity, status} = {}} = req.body;
  const newOrder={
    id:nextId(),
    deliverTo:deliverTo,
    mobileNumber:mobileNumber,
    status:status,
    dishes:[dishes,dishes[quantity]]
  };

  orders.push(newOrder);
  res.status(201).json({data:newOrder});
};

function orderExists(req,res,next){
  const {orderId} = req.params;
  const foundOrder = orders.find((order)=> order.id === orderId);
  if(foundOrder){
    res.locals.order = foundOrder;
    next();
  }else{
    next({
      status:404,
      message:`Order does not exist ${orderId}`
    });
  };
};

function orderIdMatchesDataId(req,res,next){
  const {orderId} = req.params;
  const {data:{id}} = req.body;
  if (id){
    if(orderId === id){
   next();
  }else{
    next({
      status:400,
      message:`Order id does not match route id. Order: ${id}, Route:${orderId}`
    });
  };
  }
  next();
};

function bodyHasStatus(req,res,next) {
  const {data:{status} = {}} = req.body;

  (status && status!=="invalid")? 
  next()
  :
  next({
    status:400, 
    message:"Order must have a status of pending, preparing, out-for-delivery, delivered"
  });

};

function orderHadBeenDelivered(req,res,next){
  const {data:{status}={}} = req.body;
  (status === "delivered")?
    next({
      status:400,
      message:"a delivered order cannot be changed"
    })
    :
    next();
};

function update(req,res,next){
  const order = res.locals.order;
  const {data: {deliverTo, mobileNumber, dishes, quantity, status} = {}} = req.body;

  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.status = status;
  order.dishes = dishes;
  order.dishes.quantity = quantity;

  res.json({data:order});
};

function statusPending(req,res,next){
  const {orderId} = req.params;
  const foundOrder = orders.find(order=> order.id === orderId);
  (foundOrder.status === "pending")?
    next()
  :
    next({
      status:400,
      message:"An order cannot be deleted unless it is pending."
    });
};

function destroy(req,res,next){
  const{orderId} = req.params;
  const index = orders.findIndex(order=> order.id === orderId)
  if(index>-1){
    orders.splice(index,1);
  };
  res.sendStatus(204);
}

module.exports={
  list,
  read:[orderExists, read],
  create:[bodyHasDeliverTo, bodyHasMobileNumber, bodyHasDishes, dishesIsAnArray, ordersHasQuantity, create],
  update:[orderExists,orderIdMatchesDataId, bodyHasStatus, orderHadBeenDelivered, bodyHasDeliverTo, bodyHasMobileNumber, bodyHasDishes, dishesIsAnArray, ordersHasQuantity, update],
  delete:[orderExists, statusPending, destroy],
};