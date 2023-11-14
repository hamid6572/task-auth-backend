"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var socket_io_client_1 = require("socket.io-client");
var axios_1 = require("axios");
var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0LXVzZXItaGVyZUBnLmNvbSIsImlhdCI6MTY5OTk1MzQ0NSwiZXhwIjoxNzAwMDM5ODQ1fQ.onRk4bLFhat7Hz-iHu15GuEJpaSzokAbPJR84OG4vxU';
var socket = (0, socket_io_client_1.io)('http://localhost:3000', {
    extraHeaders: {
        Authorization: "".concat(token),
    },
});
socket.on('connect', function () { return __awaiter(void 0, void 0, void 0, function () {
    var commentResponse;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('Connected to the WebSocket server');
                //on clicking comments of some post
                socket.emit('joinPostRoom', 3);
                return [4 /*yield*/, createCommentApi()];
            case 1:
                commentResponse = _a.sent();
                //on submitting comment on front-end
                if (commentResponse.success)
                    socket.emit('comment', { postId: 3, commentId: commentResponse.id });
                return [2 /*return*/];
        }
    });
}); });
socket.on('newComment', function (postId, commentId) {
    console.log('Received new comment:', { postId: postId }, { commentId: commentId });
});
socket.on('disconnect', function () {
    console.log('Disconnected from the WebSocket server');
});
var SuccessResponse = /** @class */ (function () {
    function SuccessResponse(message, id) {
        if (message === void 0) { message = 'Post deleted successfully'; }
        this.success = true;
        this.message = message;
        this.id = id;
    }
    return SuccessResponse;
}());
var createCommentApi = function () { return __awaiter(void 0, void 0, void 0, function () {
    var graphqlQuery, data, headers, response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                graphqlQuery = "\n  mutation AddComment($text: String!, $postId: Float!) {\n    createComment(data: { text: $text, postId: $postId }) {\n      message\n      success\n      id\n    }\n  }\n";
                data = {
                    query: graphqlQuery,
                    variables: {
                        postId: 3,
                        text: 'Hello from the client 3!',
                    },
                };
                headers = {
                    Authorization: "Bearer ".concat(token),
                    'Content-Type': 'application/json',
                };
                return [4 /*yield*/, axios_1.default.post('http://localhost:3000/graphql', data, {
                        headers: headers,
                    })];
            case 1:
                response = _a.sent();
                return [2 /*return*/, __assign(__assign({}, response.data.data.createComment), { id: response.data.data.createComment.id })];
        }
    });
}); };
