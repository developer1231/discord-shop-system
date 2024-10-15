"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var database_1 = require("../database/database");
var RequestType;
(function (RequestType) {
    RequestType[RequestType["SellerRequestChannel"] = 0] = "SellerRequestChannel";
    RequestType[RequestType["ReviewChannel"] = 1] = "ReviewChannel";
    RequestType[RequestType["ShopPostChannel"] = 2] = "ShopPostChannel";
    RequestType[RequestType["VerifiedSellerRole"] = 3] = "VerifiedSellerRole";
    RequestType[RequestType["AdminChannel"] = 4] = "AdminChannel";
})(RequestType || (RequestType = {}));
function returnData(type, interaction) {
    return __awaiter(this, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, database_1.execute)("SELECT * FROM guilds WHERE guild_id = ?", [
                        interaction.guild.id,
                    ])];
                case 1:
                    data = _a.sent();
                    if (type === RequestType.SellerRequestChannel) {
                        return [2 /*return*/, data[0].request_channel_id
                                ? " - <#".concat(data[0].request_channel_id, ">")
                                : ""];
                    }
                    if (type === RequestType.ReviewChannel) {
                        return [2 /*return*/, data[0].review_channel_id
                                ? " - <#".concat(data[0].review_channel_id, ">")
                                : ""];
                    }
                    if (type === RequestType.ShopPostChannel) {
                        return [2 /*return*/, data[0].shop_channel_id ? " - <#".concat(data[0].shop_channel_id, ">") : ""];
                    }
                    if (type === RequestType.VerifiedSellerRole) {
                        return [2 /*return*/, data[0].verification_role_id
                                ? " - <@&".concat(data[0].verification_role_id, ">")
                                : ""];
                    }
                    if (type === RequestType.AdminChannel) {
                        return [2 /*return*/, data[0].admin_channel ? " - <#".concat(data[0].admin_channel, ">") : ""];
                    }
                    return [2 /*return*/, ""];
            }
        });
    });
}
// guild_id TEXT PRIMARY KEY,
// review_channel_id TEXT,
// shop_channel_id TEXT,
// request_channel_id TEXT,
// verification_role_id TEXT
function isCreated(type, interaction) {
    return __awaiter(this, void 0, void 0, function () {
        var data, value, data, value, data, value, data, value, data, value;
        var _a, _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    if (!(type == RequestType.ReviewChannel)) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, database_1.execute)("SELECT * FROM guilds WHERE guild_id = ?", [
                            (_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.id,
                        ])];
                case 1:
                    data = _f.sent();
                    value = data[0]["review_channel_id"] ? "✅" : "❌";
                    return [2 /*return*/, value];
                case 2:
                    if (!(type == RequestType.SellerRequestChannel)) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, database_1.execute)("SELECT * FROM guilds WHERE guild_id = ?", [
                            (_b = interaction.guild) === null || _b === void 0 ? void 0 : _b.id,
                        ])];
                case 3:
                    data = _f.sent();
                    value = data[0]["request_channel_id"] ? "✅" : "❌";
                    return [2 /*return*/, value];
                case 4:
                    if (!(type == RequestType.ShopPostChannel)) return [3 /*break*/, 6];
                    return [4 /*yield*/, (0, database_1.execute)("SELECT * FROM guilds WHERE guild_id = ?", [
                            (_c = interaction.guild) === null || _c === void 0 ? void 0 : _c.id,
                        ])];
                case 5:
                    data = _f.sent();
                    value = data[0]["shop_channel_id"] ? "✅" : "❌";
                    return [2 /*return*/, value];
                case 6:
                    if (!(type == RequestType.AdminChannel)) return [3 /*break*/, 8];
                    return [4 /*yield*/, (0, database_1.execute)("SELECT * FROM guilds WHERE guild_id = ?", [
                            (_d = interaction.guild) === null || _d === void 0 ? void 0 : _d.id,
                        ])];
                case 7:
                    data = _f.sent();
                    value = data[0]["admin_channel"] ? "✅" : "❌";
                    return [2 /*return*/, value];
                case 8: return [4 /*yield*/, (0, database_1.execute)("SELECT * FROM guilds WHERE guild_id = ?", [
                        (_e = interaction.guild) === null || _e === void 0 ? void 0 : _e.id,
                    ])];
                case 9:
                    data = _f.sent();
                    value = data[0]["verification_role_id"] ? "✅" : "❌";
                    return [2 /*return*/, value];
            }
        });
    });
}
module.exports = { isCreated: isCreated, returnData: returnData };
