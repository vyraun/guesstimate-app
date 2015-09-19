import FunctionForm from './function-form';

export class EstimateForm{
  constructor(state){
    this.state = state;
  }
  isValid(){
    return (this.toDistribution() !== false);
  }
  toDistribution(){
    if (this.state.includes('/')){
      let [median, stdev] = this.state.split('/').map((e) => parseFloat(e.trim()));
      return {median, stdev};
    } else {
      return false;
    }
  }
}

export default class GuesstimateForm{
  constructor(state, metrics = []){
    this.metrics = metrics;
    this.state = state;
    this.guesstimate = this._guesstimate();
  }
  toJSON(){
    return ({
      input: this.state,
      isValid: this._isValid(),
      distribution: this._toDistribution()
    });
  }
  _isFunction(){
    return (this.state[0] === '=');
  }
  _isEstimate(){
    return !this._isFunction();
  }
  _guesstimate(){
    if (this._isFunction()) {
      return new FunctionForm(this.state, this.metrics);
    } else if (this._isEstimate) {
      return new EstimateForm(this.state);
    }
  }
  _toDistribution(){
    return this.guesstimate.toDistribution();
  }
  _isValid(){
    return this.guesstimate.isValid();
  }
  toEditorState(){
    if (this._isFunction()){
      return 'function';
    } else if (this._isEstimate()){
      return 'estimate';
    } else {
      return 'editing';
    }
  }
}
