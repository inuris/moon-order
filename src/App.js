import React, { Component } from 'react';
import jQuery from 'jquery';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import logo from './images/logo.png';
import { Modal, PageHeader,  Button, Badge, Table,Form, InputGroup, FormGroup, FormControl, Col, ControlLabel, Row} from 'react-bootstrap';
import NumericInput from 'react-numeric-input';
import Recaptcha from 'react-grecaptcha';
import validate from 'validate.js';
import NumberFormat from 'react-number-format';


const testMode=true;

//Google Captcha
const googleSitekey="6LeRnTMUAAAAAJk9jjYMmAqlgPTLn0sNx5EIhOJp";
let passCaptcha=false;

const verifyCallback = response => {
	if (response.length>0)
	{
		jQuery('#btSubmitOrder').prop('disabled', false);
		passCaptcha=true;
	}
	else
		passCaptcha=false;
}
const expiredCallback = () => {
	jQuery('#btSubmitOrder').prop('disabled', true);
	passCaptcha=false;
}

const constraints = {
	url: {
		presence: {
			allowEmpty: false,
			message: "Link không được để trống"
		},
		length: {
		  	minimum: 10,
		  	message: "Link chưa đúng"
		}
	},
	qty: {
		presence: {
			allowEmpty: false,
			message: "Số lượng không được để trống"
		},
		length: {
		  	minimum: 1,
		  	message: "Số lượng chưa đúng"
		}
	},
	price: {
		presence: {
			allowEmpty: false,
			message: "Giá không được để trống"
		},
		length: {
		  	minimum: 1,
		  	message: "Giá chưa đúng"
		}
	},
	name:{
		presence: {
			allowEmpty: false,
			message: "Họ tên không được để trống"
		},
		length: {
		  	minimum: 1,
		  	message: "Tên chưa đúng"
		}
	},
	email:{
		presence: {
			allowEmpty: false,
			message: "Email không được để trống"
		},
		length: {
		  	minimum: 1,
		  	message: "Tên chưa đúng"
		}
	},
	tel:{
		presence: {
			allowEmpty: false,
			message: "Số điện thoại không được để trống"
		},
		length: {
		  	minimum: 6,
		  	message: "Số điện thoại chưa đúng"
		}
	},
	address:{
		presence: {
			allowEmpty: false,
			message: "Địa chỉ không được để trống"
		},
		length: {
		  	minimum: 1,
		  	message: "Địa chỉ chưa đúng"
		}
	}
}

//Encode to URL type string
function encode(val) {
	return encodeURIComponent(val.toString().replace("\n","").replace("\t","")).replace(/'/g,"%27").replace(/"/g,"%22");	
}

// Truncate string s to length
function truncate(s,length) {
 if (s.length > length)
			 return s.substring(0,length);
		else
			 return s;
}

function creatOrderId(){
	return Date.now().toString(16);
}
class Product extends Component {
	render(){
		let note='';
		if (this.props.note!=='')
			note=<p><i>{this.props.note}</i></p>		
		return (
			<tr>
				<td>{this.props.id+1}</td>
				<td>
					<a href={this.props.url}>{this.props.url.length>90?(truncate(this.props.url,90)+"..."):this.props.url}</a>&nbsp;
					<Badge bsStyle="faded">{this.props.color}</Badge>&nbsp;
					<Badge bsStyle="faded">{this.props.size}</Badge>								
					{note}
				</td>								
				<td className="text-center">{this.props.qty}</td>
				<td className="text-center">${this.props.price}</td>
				<td className="text-center"><Button bsSize="xsmall" bsStyle="danger" onClick={() => this.props.onDelete(this.props.id)}><span className="product-remove glyphicon glyphicon-remove"></span></Button></td>
			</tr>
		);
	}
}

class App extends Component {
	constructor() {
		super();
		let localCustomer = (localStorage.getItem("_Moon_Customer") !== null) ? JSON.parse(localStorage.getItem("_Moon_Customer")) : {"name":"","address":"","email":"","tel":""};
		let localProducts = (localStorage.getItem("_Moon_Order") !== null) ? JSON.parse(localStorage.getItem("_Moon_Order")) : [];
		this.state = {
			products: localProducts,
			newProduct:{
				url:{
					value:'',
					valid:null
				},
				size:{
					value:'',
					valid:null
				},
				color:{
					value:'',
					valid:null
				},
				qty:{
					value:1,
					valid:null
				},
				price:{
					value:'',
					formattedValue:'',
					valid:null
				},
				note:{
					value:'',
					valid:null
				},
			},
			customer:localCustomer,
			customerValid:{
				"name":null,
				"address":null,
				"email":null,
				"tel":null
			},
			showModal: false,
		};				
		this.openModal=this.openModal.bind(this);
		this.closeModal=this.closeModal.bind(this);
		this.addProduct=this.addProduct.bind(this);
		this.updateLocalOrder=this.updateLocalOrder.bind(this);
	}
	componentDidMount() {
		//Test Mode Only
		if (testMode===true){
			passCaptcha=true;
			jQuery('#btSubmitOrder').prop('disabled', false);
		}
		
	}	
	handleDelete(index) {
		this.state.products.splice(index, 1);
		this.setState({
			products: this.state.products
		},
			()=>{
				this.updateLocalOrder()
			}

		);
	}
	openModal() {
		this.setState({
		  showModal: true
		})
	}
	closeModal() {
		this.setState({
		  showModal: false
		})
	  }
	addProduct() {
		let formIsValid = true;
		let { newProduct } = this.state;

		let urlValid=(validate.single(newProduct.url.value,constraints['url']))?false:true;		
		newProduct.url.valid = (urlValid)?'success':'error';

		let qtyValid=(newProduct.qty.value>0);
		newProduct.qty.valid = (qtyValid)?'success':'error';

		let priceValid=(validate.single(newProduct.price.value,constraints['price']))?false:true;	
		newProduct.price.valid = (priceValid)?'success':'error';
		formIsValid = formIsValid && urlValid;
		formIsValid = formIsValid && qtyValid;
		formIsValid = formIsValid && priceValid;
		
		this.setState({ newProduct:newProduct });

		if (formIsValid===true){

			
			this.setState({ 
				products: this.state.products.concat([{
					url: this.state.newProduct.url.value,
					color: this.state.newProduct.color.value,
					size: this.state.newProduct.size.value,
					qty: this.state.newProduct.qty.value,
					price: this.state.newProduct.price.formattedValue,
					note: this.state.newProduct.note.value
				}]),
				newProduct:{
					url:{
						value:'',
						valid:null
					},
					size:{
						value:'',
						valid:null
					},
					color:{
						value:'',
						valid:null
					},
					qty:{
						value:1,
						valid:null
					},
					price:{
						value:'',
						formattedValue:'',
						valid:null
					},
					note:{
						value:'',
						valid:null
					},
				},
				showModal: false,				
				},
				()=>{
					this.updateLocalOrder()
				}
			);			
			
		}

	}  
	handleProduct(e, element) {
		let { newProduct } = this.state;
		switch(element) {
			case 'qty':
				newProduct[element].value = e;
				break;
			case 'price':
				const {formattedValue, value} = e;
				newProduct[element].value = value;
				newProduct[element].formattedValue = formattedValue;
				break;		
			default:				
				newProduct[element].value = e.target.value;
		}
		this.setState({ newProduct:newProduct });
	}
	updateLocalOrder(){
		localStorage.setItem("_Moon_Order", JSON.stringify(this.state.products));
	}
	handleCustomer(e, element) {
		let { customer } = this.state;
		customer[element] = e.target.value;
		this.setState({ customer:customer });
	}
	submitOrder(e){
		e.preventDefault();
		if (passCaptcha===true)
		{
			let formIsValid = true;
			let customer = this.state.customer;
			let customerValid=[
				"name":null,
				"address":null,
				"email":null,
				"tel":null
			];
			customerValid.map((key) => {
				let keyValid=(validate.single(customer[key],constraints[key]))?false:true;	
				customerValid[key]=(keyValid)?'success':'error';
				formIsValid = formIsValid && keyValid;
				return keyValid;
			});

			if (formIsValid===true){
				localStorage.setItem("_Moon_Customer", JSON.stringify(this.state.customer));			
				
				if (this.state.products.length>0){

					let orderId=`order_id=${encode(creatOrderId())}`;
					let customerString=`customer=${encode(this.state.customer.name)}%0A${encode(this.state.customer.address)}%20%7C%20${encode(this.state.customer.email)}%20%7C%20${encode(this.state.customer.tel)}`;

					let productString= "product="+ this.state.products.map((p, i) => {
						return `${i}%20%7C%20${encode(p.url)}%20%7C%20${encode(p.color)}%20%7C%20${encode(p.size)}%20%7C%20${encode(p.qty)}%20%7C%20${encode(p.price)}%20%7C%20${encode(p.note)}`;				
					}).join('%0A');
					if (testMode===false) {
						let request = jQuery.ajax({
								url: "https://script.google.com/macros/s/AKfycbxLdfX_J4us1-STkKs0l7MxJmwGhQJqbmXikuo-NrDTagTncQDu/exec",
								type: "post",
								data: orderId+"&"+customerString+"&"+productString
							});		
						// callback handler that will be called on success
						request.done(function (response, textStatus, jqXHR){
							// log a message to the console
							console.log("Success");
						});		
						// callback handler that will be called on failure
						request.fail(function (jqXHR, textStatus, errorThrown){
							// log the error to the console
							console.error(
								"The following error occured: "+
								textStatus, errorThrown
							);				
						});	
					}
					this.setState({ 
							products:[]
						},
							()=>{
								this.updateLocalOrder()
							}
						)
					window.grecaptcha.reset();
					expiredCallback();
					alert("Yêu cầu báo giá đã được gửi.\nMoon sẽ liên hệ báo giá trong thời gian sớm nhất. Chi tiết xin liên hệ: support@moonhangmy.com");
				}
				else
					alert("Vui lòng thêm sản phẩm cần báo giá vào danh sách.");
			}
			else{
				this.setState({ 
						customerValid:customerValid
					})
				alert("Vui lòng điền đầy đủ thông tin.");
			}
		}
		else
			alert("Đã có lỗi xảy ra. Vui lòng liên hệ: support@moonhangmy.com để được báo giá.");
		
	}
	render() {
		let productList=<tr><td className="text-center" colspan="5"><i>Chưa có sản phẩm nào</i></td></tr>;
		if (this.state.products.length>0) {
			productList=this.state.products.map((p, i) => 
									<Product 
										key={i} 
										id={i} 
										url={p.url} 
										color={p.color} 
										size={p.size} 
										qty={p.qty} 
										price={p.price} 
										note={p.note}
										onDelete={id => this.handleDelete(id)}
									/>
								)
		}
		return (
			<div className="container">
				<PageHeader>
					<img src={logo} alt="Moon"/>
					<span>&nbsp;&nbsp;&nbsp;Báo giá vận chuyển hàng Mỹ - Việt</span>
				</PageHeader>
				<Col sm={7}>
					<Row>
						<h3>Danh sách sản phẩm</h3>						
					</Row>
					<Modal show={this.state.showModal} onHide={() => this.closeModal()}>
						<Modal.Header closeButton>
							<Modal.Title><h2>Thêm sản phẩm vào danh sách</h2></Modal.Title>
						</Modal.Header>
						<Modal.Body>

						<FormGroup validationState={this.state.newProduct.url.valid}>	
							<ControlLabel className='required'>Link sản phẩm</ControlLabel>
							<FormControl
								type="text"
								value={this.state.newProduct.url.value}
								placeholder="Link sản phẩm"
								onChange={e => this.handleProduct(e, 'url')}								
								required
								/>
							<FormControl.Feedback />
						</FormGroup>
							
						<Row>
							<Col xs={6}>
								<FormGroup validationState={this.state.newProduct.qty.valid}>								
									<ControlLabel className='required'>Số lượng</ControlLabel>									
										<NumericInput
											className='form-control'
											value={this.state.newProduct.qty.value}
											onChange={e => this.handleProduct(e, 'qty')}
											/>
									
								</FormGroup>
							</Col>
							<Col xs={6}>
								<FormGroup validationState={this.state.newProduct.price.valid}>
									<ControlLabel className='required'>Giá web</ControlLabel>
									<InputGroup>								        							
										<NumberFormat 
											className="form-control"
											type="text"
											value={this.state.newProduct.price.value}
											thousandSeparator={true} 
											placeholder="Giá web"
											onValueChange={e => this.handleProduct(e, 'price')}
											/>
										<InputGroup.Addon>USD</InputGroup.Addon>
									</InputGroup>
									<FormControl.Feedback />
								</FormGroup>
							</Col>
						</Row>						
						<hr />						
						<Row>
							<Col xs={6}>
								<FormGroup>
									<ControlLabel>Màu sắc</ControlLabel>
									<FormControl
										type="text"
										value={this.state.newProduct.color.value}
										placeholder="Màu sắc"
										onChange={e => this.handleProduct(e, 'color')}
										/>
								</FormGroup>
							</Col>
							<Col xs={6}>
								<FormGroup>
									<ControlLabel>Size</ControlLabel>
									<FormControl
										type="text"
										value={this.state.newProduct.size.value}
										placeholder="Size"
										onChange={e => this.handleProduct(e, 'size')}
										/>
								</FormGroup>
							</Col>
						</Row>
						<FormGroup>
							<ControlLabel>Ghi chú</ControlLabel>
							<FormControl
								type="textarea"
								componentClass="textarea"
								value={this.state.newProduct.note.value}
								placeholder="Ghi chú"
								onChange={e => this.handleProduct(e, 'note')}
								/>
						</FormGroup>
						</Modal.Body>
						<Modal.Footer>
							<Button bsStyle="primary" onClick={() => this.addProduct()}>
							  Thêm vào danh sách
							</Button>
							<Button onClick={() => this.closeModal()}>Hủy bỏ</Button>
						</Modal.Footer>	
					</Modal>
					<Row>
						<Table striped hover>
							<thead>
								<tr>
									<th className="col-xs-1">#</th>
									<th className="col-xs-8">Link</th>
									<th className="col-xs-1 text-center">Số lượng</th>
									<th className="col-xs-1 text-center">Giá web</th>
									<th className="col-xs-1 text-center">Xóa</th>
								</tr>
							</thead>
							<tbody>
								{productList}
							</tbody>
						</Table>
					</Row>	
					<Row>
						<Button bsStyle="primary" onClick={() => this.openModal()}>Thêm sản phẩm</Button>
					</Row>				
				</Col>
				<Col sm={5}>
					<Form id="formOrder" horizontal onSubmit={e => this.submitOrder(e)}>

						<h3>Thông tin khách hàng</h3>
						<FormGroup validationState={this.state.customerValid.name}>
							<Col componentClass={ControlLabel} className='required' md={3}>Họ tên: </Col>
							<Col md={9}>
								<FormControl
									type="text"
									value={this.state.customer.name}
									placeholder="Họ tên"
									onChange={e => this.handleCustomer(e, 'name')}
									/>
								<FormControl.Feedback />
							</Col>
						</FormGroup>
						<FormGroup validationState={this.state.customerValid.address}>
							<Col componentClass={ControlLabel} md={3}>Địa chỉ: </Col>
							<Col md={9}>
								<FormControl
									type="text"
									value={this.state.customer.address}
									placeholder="Địa chỉ"
									onChange={e => this.handleCustomer(e, 'address')}
									/>
								<FormControl.Feedback />
							</Col>
						</FormGroup>
						<FormGroup validationState={this.state.customerValid.email}>
							<Col componentClass={ControlLabel} className='required' md={3}>Email: </Col>
							<Col md={9}>
								<FormControl
									type="text"
									value={this.state.customer.email}
									placeholder="Email"
									onChange={e => this.handleCustomer(e, 'email')}
									/>
								<FormControl.Feedback />
							</Col>
						</FormGroup>
						<FormGroup validationState={this.state.customerValid.tel}>					
							<Col componentClass={ControlLabel} className='required' md={3}>Điện thoại: </Col>
							<Col md={9}>
								<NumberFormat 
									className="form-control"
									type="text"
									value={this.state.customer.tel}
									placeholder="Điện thoại"
									onChange={e => this.handleCustomer(e, 'tel')}
									/>
								<FormControl.Feedback />
							</Col>
						</FormGroup>
						<FormGroup>	
							<Col md={9} mdOffset={3}>
								<Recaptcha
								  sitekey={googleSitekey}
								  callback={verifyCallback}
								  expiredCallback={expiredCallback}
								  locale="vi"
								/>
							</Col>
						</FormGroup>
						<FormGroup>	
							<Col md={9} mdOffset={3}>
								<Button id="btSubmitOrder" type="submit" block bsStyle="success" disabled>Gửi yêu cầu báo giá</Button>
							</Col>
						</FormGroup>	
					</Form>
				</Col>
			</div>
		)
	}
}
export default App;
