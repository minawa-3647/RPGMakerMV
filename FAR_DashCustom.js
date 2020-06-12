//=============================================================================
// FAR_DashCustom.js
// ----------------------------------------------------------------------------
// Copyright (c) 2020 水沫(みなわ)
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.2 2020/06/12 独自のクラスを宣言＆処理をする形から、Game_Playerクラスに処理追加する形に変更
// 1.0.1 2020/06/12 カウント処理部分をオブジェクト指向的な記述に書き換え
// 1.0.0 2020/06/11 初版
// ----------------------------------------------------------------------------
// [Contact]   : https://github.com/minawa-3647
//=============================================================================

/*:
 * @plugindesc ダッシュの速度を変更したり、加減速率の概念を加えたりするプラグインです。
 * @author 水沫(みなわ)
 * 
 * @param ControlSwitchNo
 * @desc 機能制御用スイッチ番号
 * @type switch
 * @default 0
 * 
 * @param DashSpeedVariableNo
 * @desc ダッシュの速度値を設定する変数番号
 * @type variable
 * @default 0
 * 
 * @param AccelerationFlag
 * @desc ダッシュに加減速率の概念を付与するフラグ
 * @type boolean
 * @default false
 * 
 * @help プラグインコマンドはありません。
 * 
 * ControlSwitchNo に指定したスイッチが ON のとき、プラグイン機能が有効になります。
 * ・ControlSwitchNoにスイッチの指定を行わない(既定値0のまま)場合、機能無効です。
 * ・指定したスイッチをOFFにした場合も、機能無効（通常のダッシュ処理となる）です。
 * 
 * DashSpeedVariableNo に指定した変数番号の値がダッシュ時の速度値となります。
 * ・値として1を指定すると通常のダッシュと等速、数値を増せば増すほど速くなります。
 * ・0で歩行時と同じ速度、たとえば重力の影響でダッシュ速度が変わるなどの演出が可能。
 * 
 * AccelerationFlag が true のとき、ダッシュに加減速率の要素が加わります。
 * ・ダッシュ開始直後は加速が鈍く、ダッシュ終了直後はまだ加速が残っている。
 * ・いわゆるスーパーマ〇オ的ダッシュと思っていただければそんな感じです。
 * 
 * 利用規約：
 * このプラグインはMITライセンスです。
 * 作者に無断で改変、再配布、商用利用、18禁製品利用など無問題です。
 * ただし、プラグイン本体の著作権表示と本許諾表示は残しておいてください。
 * また、本プラグインを使って何か問題が起きても、作者は一切関知しません。
 */

(function(){
    'use strict';

    var pName = "FAR_DashCustom";
    var parameters = PluginManager.parameters(pName);

    //@paramの型再設定用関数（ツクールの仕様でparameters通した時点でstring型になっている）
    var getParamNumber = function(param) { return Number(param) || 0; }
    var getParamBoolean = function(param) { return param.toLowerCase() === 'true'; }

    //パラメータを変数に設定
    var cSwitchNo = getParamNumber(parameters['ControlSwitchNo']);
    var dSpeedVariableNo = getParamNumber(parameters['DashSpeedVariableNo']);
    var aFlag = getParamBoolean(parameters['AccelerationFlag']);

    //プラグイン内変数の設定
    var dashCount = 0;
    var dashSpeed = 0;

    //=============================================================================
    // Game_Player
    //  ダッシュ時の加速度関連情報を追加定義します
    //=============================================================================
    var _Game_Player_initialize = Game_Player.prototype.initialize;
    Game_Player.prototype.initialize = function() {
        var result = _Game_Player_initialize.call(this);
        this._countVal = 0;
        return result;
    };

    var _Game_Player_moveByInput = Game_Player.prototype.moveByInput;
    Game_Player.prototype.moveByInput = function() {
        var result = _Game_Player_moveByInput.call(this);

        dashCount = this.countController(100, 30);

        return result;
    };

    //プラグイン定義関数。戻り値はinitializeで生成される_countValの現在値
    //毎フレーム単位で呼び出され、呼び出された際の_countValと引数をもとに、_countValの増減を行う
    Game_Player.prototype.countController = function(maxCount, switchCount) {
        this.maxCount = maxCount;
        this.switchCount = switchCount;
    
        if($gameSwitches.value(cSwitchNo)){
            if (this.isMoving() && this.isDashing()) {
                if(this._countVal >= this.maxCount){
                    this._countVal = this.maxCount;
                }
                else if(this._countVal >= this.switchCount && this._countVal < this.maxCount){
                    this._countVal += 2;
                }
                else{
                    this._countVal++;
                }
            }
            else{
                if(this._countVal <= 0){
                    this._countVal = 0;
                }
                else if(this._countVal > 0 && this._countVal <= this.switchCount){
                    this._countVal -= 2;
                }
                else{
                    this._countVal--;
                }
            }
        }
    
        return this._countVal;
    };


    //=============================================================================
    // Game_CharacterBase
    //  移動時の速度を定義しているコアスクリプトの関数を改修
    //  スイッチによって、コアスクリプトの通常処理とプラグイン処理が可変となるよう設定
    //=============================================================================
    var _Game_CharacterBase_realMoveSpeed = Game_CharacterBase.prototype.realMoveSpeed;
    Game_CharacterBase.prototype.realMoveSpeed = function() {
        if($gameSwitches.value(cSwitchNo)){
            dashSpeed = $gameVariables.value(dSpeedVariableNo);
            if(aFlag){
                //速度および加速度、加速からの減速が有効になるver
                return this._moveSpeed + (dashCount * 0.01) * dashSpeed;
            }
            else{
                //コアスクリプト通常処理の速度のみ変わるver
                return this._moveSpeed + (this.isDashing() ? dashSpeed : 0);
            }
        }
        else{
            return _Game_CharacterBase_realMoveSpeed.call(this);
        }
    };

})();